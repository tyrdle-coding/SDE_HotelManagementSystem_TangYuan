import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const defaultDbPath = path.join(__dirname, 'data', 'db.json');
const distPath = path.join(rootDir, 'frontend', 'dist');
const uploadsDir = path.join(__dirname, 'uploads');
const port = process.env.PORT || 3001;
const sessionCookieName = 'hotel_session';

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

async function readDb(dbPath) {
  const content = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(content);
}

async function writeDb(dbPath, data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
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
      if (separatorIndex === -1) {
        return cookies;
      }

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
  return {
    user: publicUser(user),
  };
}

function isPasswordValid(user, password) {
  if (user.passwordHash) {
    return verifyPassword(password, user.passwordHash);
  }

  return user.password === password;
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function buildAdminStats(db) {
  const totalRevenue = db.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const totalRooms = db.rooms.length;
  const availableRooms = db.rooms.filter((room) => room.available).length;
  const occupiedRoomIds = new Set(
    db.bookings
      .filter((booking) => booking.status === 'confirmed' || booking.status === 'pending')
      .map((booking) => booking.roomId),
  );
  const occupancyRate = db.rooms.length === 0 ? 0 : Math.round((occupiedRoomIds.size / db.rooms.length) * 100);
  const monthlyMap = new Map();

  for (const booking of db.bookings) {
    const date = new Date(booking.createdAt);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        revenue: 0,
        bookings: 0,
      });
    }
    const item = monthlyMap.get(key);
    item.revenue += booking.totalPrice;
    item.bookings += 1;
  }

  const monthlyData = Array.from(monthlyMap.values()).slice(-6);
  const recentBookings = [...db.bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    totalRevenue,
    totalBookings: db.bookings.length,
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

  if (room.images.length === 0) {
    room.images = [room.image];
  }

  if (room.amenities.length === 0) {
    return { error: 'At least one amenity is required' };
  }

  return { room };
}

function isValidBookingStatus(status) {
  return new Set(['confirmed', 'pending', 'cancelled', 'completed']).has(status);
}

function normalizePaymentMethod(paymentMethod) {
  return new Set(['bank_transfer', 'cash']).has(paymentMethod) ? paymentMethod : 'bank_transfer';
}

async function migrateLegacyUser(user, password, saveDb, db) {
  if (!user.passwordHash) {
    user.passwordHash = hashPassword(password);
    delete user.password;
    await saveDb(db);
  }
}

export function createApp(options = {}) {
  const dbPath = options.dbPath ?? defaultDbPath;
  const app = express();

  async function loadDb() {
    return readDb(dbPath);
  }

  async function saveDb(data) {
    await writeDb(dbPath, data);
  }

  async function attachAuth(req, _res, next) {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      req.auth = null;
      next();
      return;
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      req.auth = null;
      next();
      return;
    }

    const db = await loadDb();
    const user = db.users.find((item) => item.id === payload.sub && item.email === payload.email);
    req.auth = user ? publicUser(user) : null;
    next();
  }

  function requireAuth(req, res, next) {
    if (!req.auth) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
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

  app.get('/api/health', (_req, res) => {
    const startNs = process.hrtime.bigint();
    const mem = process.memoryUsage();
    const responseTimeMs = Number(process.hrtime.bigint() - startNs) / 1e6;

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssBytes: mem.rss,
        heapUsedBytes: mem.heapUsed,
        heapTotalBytes: mem.heapTotal,
      },
      responseTimeMs,
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.auth });
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const db = await loadDb();
    const user = db.users.find((item) => item.email.toLowerCase() === email);

    if (!user || !isPasswordValid(user, password)) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    await migrateLegacyUser(user, password, saveDb, db);
    res.json(createSessionResponse(user, res));
  });

  app.post('/api/auth/register', async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    const db = await loadDb();
    const existingUser = db.users.find((item) => item.email.toLowerCase() === email);
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const user = {
      id: `U${Date.now()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'user',
    };

    db.users.unshift(user);
    await saveDb(db);
    res.status(201).json(createSessionResponse(user, res));
  });

  app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.get('/api/rooms', async (_req, res) => {
    const db = await loadDb();
    res.json({ rooms: db.rooms });
  });

  app.get('/api/rooms/:id', async (req, res) => {
    const db = await loadDb();
    const room = db.rooms.find((item) => item.id === req.params.id);

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    res.json({ room });
  });

  app.post('/api/rooms', requireAdmin, async (req, res) => {
    const db = await loadDb();
    const validation = validateRoomPayload(req.body);
    if (validation.error) {
      res.status(400).json({ message: validation.error });
      return;
    }

    const room = {
      id: String(Date.now()),
      ...validation.room,
    };

    db.rooms.unshift(room);
    await saveDb(db);
    res.status(201).json({ room });
  });

  app.put('/api/rooms/:id', requireAdmin, async (req, res) => {
    const db = await loadDb();
    const index = db.rooms.findIndex((item) => item.id === req.params.id);
    const validation = validateRoomPayload(req.body);

    if (index === -1) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (validation.error) {
      res.status(400).json({ message: validation.error });
      return;
    }

    db.rooms[index] = {
      id: db.rooms[index].id,
      ...validation.room,
    };

    await saveDb(db);
    res.json({ room: db.rooms[index] });
  });

  app.delete('/api/rooms/:id', requireAdmin, async (req, res) => {
    const db = await loadDb();
    const room = db.rooms.find((item) => item.id === req.params.id);

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    db.rooms = db.rooms.filter((item) => item.id !== req.params.id);
    db.bookings = db.bookings.filter((booking) => booking.roomId !== req.params.id);
    await saveDb(db);
    res.json({ success: true });
  });

  app.get('/api/bookings', requireAuth, async (req, res) => {
    const db = await loadDb();
    const { userId } = req.query;
    const bookings = req.auth.role === 'admin'
      ? userId
        ? db.bookings.filter((booking) => booking.userId === userId)
        : db.bookings
      : db.bookings.filter((booking) => booking.userId === req.auth.id);
    res.json({ bookings });
  });

  app.post('/api/bookings', requireAuth, async (req, res) => {
    const { roomId, userName, checkIn, checkOut, guests, phone, specialRequests, paymentMethod } = req.body ?? {};
    const db = await loadDb();
    const room = db.rooms.find((item) => item.id === roomId);

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      res.status(400).json({ message: 'Check-out must be after check-in' });
      return;
    }

    if (!userName || !Number.isFinite(Number(guests)) || Number(guests) <= 0) {
      res.status(400).json({ message: 'Missing required booking information' });
      return;
    }

    const totalPrice = Number((room.price * nights * 1.1).toFixed(2));
    const booking = {
      id: `B${Date.now()}`,
      roomId,
      roomName: room.name,
      userId: req.auth.id,
      userName: String(userName).trim(),
      userEmail: req.auth.email,
      checkIn,
      checkOut,
      guests: Number(guests),
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: normalizePaymentMethod(paymentMethod),
      createdAt: new Date().toISOString(),
      phone,
      specialRequests,
    };

    db.bookings.unshift(booking);
    await saveDb(db);
    res.status(201).json({ booking });
  });

  app.patch('/api/bookings/:id/payment', requireAuth, async (req, res) => {
    const { paymentStatus } = req.body ?? {};
    const db = await loadDb();
    const booking = db.bookings.find((item) => item.id === req.params.id);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (req.auth.role !== 'admin' && booking.userId !== req.auth.id) {
      res.status(403).json({ message: 'You can only update your own booking payment' });
      return;
    }

    const validPaymentStatuses = new Set(['pending', 'paid', 'refunded']);
    if (!validPaymentStatuses.has(paymentStatus)) {
      res.status(400).json({ message: 'Invalid payment status' });
      return;
    }

    booking.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      booking.status = 'confirmed';
    }
    await saveDb(db);
    res.json({ booking });
  });

  app.patch('/api/bookings/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body ?? {};
    const db = await loadDb();
    const booking = db.bookings.find((item) => item.id === req.params.id);

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (!isValidBookingStatus(status)) {
      res.status(400).json({ message: 'Invalid booking status' });
      return;
    }

    booking.status = status;
    await saveDb(db);
    res.json({ booking });
  });

  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    const db = await loadDb();
    res.json({ stats: buildAdminStats(db) });
  });

  app.use(express.static(distPath));

  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }

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
