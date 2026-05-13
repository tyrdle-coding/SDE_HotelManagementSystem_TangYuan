import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createSessionToken, verifySessionToken } from './auth.js';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distPath = path.join(rootDir, 'frontend', 'dist');
const uploadsDir = path.join(__dirname, 'uploads');
const port = process.env.PORT || 3001;
const sessionCookieName = 'hotel_session';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
  };
}

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

function getSessionTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie ?? '');
  return cookies[sessionCookieName] ?? null;
}

function setSessionCookie(res, token) {
  const maxAge = 12 * 60 * 60;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function createSessionResponse(user, res) {
  setSessionCookie(res, createSessionToken(user));
  return { user: publicUser(user) };
}

function isPasswordValid(user, password) {
  if (user.password_hash || user.passwordHash) {
    return verifyPassword(password, user.password_hash ?? user.passwordHash);
  }
  return user.password === password;
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isValidBookingStatus(status) {
  return new Set(['confirmed', 'pending', 'cancelled', 'completed']).has(status);
}

function normalizePaymentMethod(paymentMethod) {
  return new Set(['bank_transfer', 'cash']).has(paymentMethod) ? paymentMethod : 'bank_transfer';
}

function buildAdminStats(rooms, bookings) {
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.available).length;
  const occupiedRoomIds = new Set(
    bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'pending')
      .map((b) => b.room_id),
  );
  const occupancyRate =
    rooms.length === 0 ? 0 : Math.round((occupiedRoomIds.size / rooms.length) * 100);

  const monthlyMap = new Map();
  for (const booking of bookings) {
    const date = new Date(booking.created_at);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        revenue: 0,
        bookings: 0,
      });
    }
    const item = monthlyMap.get(key);
    item.revenue += Number(booking.total_price);
    item.bookings += 1;
  }

  const monthlyData = Array.from(monthlyMap.values()).slice(-6);
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    totalRevenue,
    totalBookings: bookings.length,
    totalRooms,
    availableRooms,
    occupancyRate,
    monthlyData,
    recentBookings,
  };
}

function validateRoomPayload(payload) {
  const room = {
    name: String(payload?.name ?? '').trim(),
    type: String(payload?.type ?? '').trim(),
    price: Number(payload?.price),
    image: String(payload?.image ?? '').trim(),
    images: Array.isArray(payload?.images)
      ? payload.images.map((item) => String(item).trim()).filter(Boolean)
      : [],
    capacity: Number(payload?.capacity),
    size: Number(payload?.size),
    description: String(payload?.description ?? '').trim(),
    amenities: Array.isArray(payload?.amenities)
      ? payload.amenities.map((item) => String(item).trim()).filter(Boolean)
      : [],
    available: Boolean(payload?.available),
  };

  const validTypes = new Set(['Standard', 'Deluxe', 'Suite', 'Penthouse']);
  if (!room.name || !validTypes.has(room.type) || !room.image || !room.description) {
    return { error: 'Missing required room information' };
  }

  if (
    !Number.isFinite(room.price) ||
    room.price <= 0 ||
    !Number.isFinite(room.capacity) ||
    room.capacity <= 0 ||
    !Number.isFinite(room.size) ||
    room.size <= 0
  ) {
    return { error: 'Room price, capacity, and size must be valid positive numbers' };
  }

  if (room.images.length === 0) room.images = [room.image];
  if (room.amenities.length === 0) return { error: 'At least one amenity is required' };

  return { room };
}

export function createApp() {
  const app = express();

  async function attachAuth(req, _res, next) {
    const token = getSessionTokenFromRequest(req);
    if (!token) { req.auth = null; return next(); }

    const payload = verifySessionToken(token);
    if (!payload) { req.auth = null; return next(); }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .eq('email', payload.email)
      .single();

    req.auth = user ? publicUser(user) : null;
    next();
  }

  function requireAuth(req, res, next) {
    if (!req.auth) { res.status(401).json({ message: 'Authentication required' }); return; }
    next();
  }

  function requireAdmin(req, res, next) {
    if (!req.auth || req.auth.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  }

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(attachAuth);
  app.use('/uploads', express.static(uploadsDir));

  // ── Health ────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    const startNs = process.hrtime.bigint();
    const mem = process.memoryUsage();
    const responseTimeMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: { rssBytes: mem.rss, heapUsedBytes: mem.heapUsed, heapTotalBytes: mem.heapTotal },
      responseTimeMs,
    });
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.auth });
  });

  app.put('/api/auth/me', requireAuth, async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = String(req.body?.phone ?? '').trim();

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }

    const { data: duplicate } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', req.auth.id)
      .single();

    if (duplicate) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ name, email, phone })
      .eq('id', req.auth.id)
      .select()
      .single();

    if (error || !user) {
      res.status(500).json({ message: error?.message ?? 'Failed to update user' });
      return;
    }

    await supabase
      .from('bookings')
      .update({ user_name: name, user_email: email })
      .eq('user_id', req.auth.id);

    res.json(createSessionResponse(user, res));
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || !isPasswordValid(user, password)) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.json(createSessionResponse(user, res));
  });

  app.post('/api/auth/register', async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = String(req.body?.phone ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!name || !email || !phone || !password) {
      res.status(400).json({ message: 'Name, email, phone, and password are required' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const newUser = {
      id: `U${Date.now()}`,
      name,
      email,
      phone,
      password_hash: hashPassword(password),
      role: 'user',
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(createSessionResponse(newUser, res));
  });

  // ── Upload ────────────────────────────────────────────────────────────────
  app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // ── Rooms ─────────────────────────────────────────────────────────────────
  app.get('/api/rooms', async (_req, res) => {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ rooms: data });
  });

  app.get('/api/rooms/:id', async (req, res) => {
    const { data, error } = await supabase
      .from('rooms').select('*').eq('id', req.params.id).single();
    if (error || !data) { res.status(404).json({ message: 'Room not found' }); return; }
    res.json({ room: data });
  });

  app.post('/api/rooms', requireAdmin, async (req, res) => {
    const validation = validateRoomPayload(req.body);
    if (validation.error) { res.status(400).json({ message: validation.error }); return; }

    const room = { id: String(Date.now()), ...validation.room };
    const { error } = await supabase.from('rooms').insert(room);
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.status(201).json({ room });
  });

  app.put('/api/rooms/:id', requireAdmin, async (req, res) => {
    const validation = validateRoomPayload(req.body);
    if (validation.error) { res.status(400).json({ message: validation.error }); return; }

    const { data: existing } = await supabase
      .from('rooms').select('id').eq('id', req.params.id).single();
    if (!existing) { res.status(404).json({ message: 'Room not found' }); return; }

    const { data, error } = await supabase
      .from('rooms').update(validation.room).eq('id', req.params.id).select().single();
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ room: data });
  });

  app.delete('/api/rooms/:id', requireAdmin, async (req, res) => {
    const { data: existing } = await supabase
      .from('rooms').select('id').eq('id', req.params.id).single();
    if (!existing) { res.status(404).json({ message: 'Room not found' }); return; }

    await supabase.from('bookings').delete().eq('room_id', req.params.id);

    const { error } = await supabase.from('rooms').delete().eq('id', req.params.id);
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ success: true });
  });

  // ── Bookings ──────────────────────────────────────────────────────────────
  app.get('/api/bookings', requireAuth, async (req, res) => {
    let query = supabase.from('bookings').select('*');

    if (req.auth.role === 'admin') {
      if (req.query.userId) query = query.eq('user_id', req.query.userId);
    } else {
      query = query.eq('user_id', req.auth.id);
    }

    const { data, error } = await query;
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ bookings: data });
  });

  app.post('/api/bookings', requireAuth, async (req, res) => {
    const { roomId, userName, checkIn, checkOut, guests, phone, specialRequests, paymentMethod } =
      req.body ?? {};

    const { data: room, error: roomError } = await supabase
      .from('rooms').select('*').eq('id', roomId).single();
    if (roomError || !room) { res.status(404).json({ message: 'Room not found' }); return; }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) { res.status(400).json({ message: 'Check-out must be after check-in' }); return; }
    if (!userName || !Number.isFinite(Number(guests)) || Number(guests) <= 0) {
      res.status(400).json({ message: 'Missing required booking information' });
      return;
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    const isBankPayment = normalizedPaymentMethod === 'bank_transfer';
    const booking = {
      id: `B${Date.now()}`,
      room_id: roomId,
      room_name: room.name,
      user_id: req.auth.id,
      user_name: String(userName).trim(),
      user_email: req.auth.email,
      check_in: checkIn,
      check_out: checkOut,
      guests: Number(guests),
      total_price: Number((room.price * nights * 1.1).toFixed(2)),
      status: isBankPayment ? 'confirmed' : 'pending',
      payment_status: isBankPayment ? 'paid' : 'pending',
      payment_method: normalizedPaymentMethod,
      created_at: new Date().toISOString(),
      phone,
      special_requests: specialRequests,
    };

    const { error } = await supabase.from('bookings').insert(booking);
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.status(201).json({ booking });
  });

  app.patch('/api/bookings/:id/payment', requireAuth, async (req, res) => {
    const { paymentStatus } = req.body ?? {};

    const { data: booking, error: fetchError } = await supabase
      .from('bookings').select('*').eq('id', req.params.id).single();
    if (fetchError || !booking) { res.status(404).json({ message: 'Booking not found' }); return; }

    if (req.auth.role !== 'admin' && booking.user_id !== req.auth.id) {
      res.status(403).json({ message: 'You can only update your own booking payment' });
      return;
    }

    const validPaymentStatuses = new Set(['pending', 'paid', 'refunded']);
    if (!validPaymentStatuses.has(paymentStatus)) {
      res.status(400).json({ message: 'Invalid payment status' });
      return;
    }

    const updates = { payment_status: paymentStatus };
    if (paymentStatus === 'paid') updates.status = 'confirmed';

    const { data, error } = await supabase
      .from('bookings').update(updates).eq('id', req.params.id).select().single();
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ booking: data });
  });

  app.patch('/api/bookings/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body ?? {};

    if (!isValidBookingStatus(status)) {
      res.status(400).json({ message: 'Invalid booking status' });
      return;
    }

    const { data: existing } = await supabase
      .from('bookings').select('id').eq('id', req.params.id).single();
    if (!existing) { res.status(404).json({ message: 'Booking not found' }); return; }

    const { data, error } = await supabase
      .from('bookings').update({ status }).eq('id', req.params.id).select().single();
    if (error) { res.status(500).json({ message: error.message }); return; }
    res.json({ booking: data });
  });

  // ── Admin stats ───────────────────────────────────────────────────────────
  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    const [{ data: rooms }, { data: bookings }] = await Promise.all([
      supabase.from('rooms').select('*'),
      supabase.from('bookings').select('*'),
    ]);
    res.json({ stats: buildAdminStats(rooms ?? [], bookings ?? []) });
  });

  // ── Serve frontend build ──────────────────────────────────────────────────
  app.use(express.static(distPath));

  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api')) { next(); return; }
    try {
      await fs.access(path.join(distPath, 'index.html'));
      res.sendFile(path.join(distPath, 'index.html'));
    } catch {
      res.status(404).send('Build the frontend first or run the Vite dev server.');
    }
  });

  return app;
}

const app = createApp();

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(port, () => {
    console.log(`Hotel app server running on http://localhost:${port}`);
  });
}
