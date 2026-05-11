import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import request from 'supertest';
import crypto from 'node:crypto';

jest.setTimeout(15000);

function hashPassword(p) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

// ── In-memory store (reset before each test) ──────────────────────────────────
let db;

function resetDb() {
  db = {
    users: [
      {
        id: 'U001',
        name: 'Admin',
        email: 'admin@hhotel.com',
        phone: '+60 12-345 6789',
        password_hash: hashPassword('admin123'),
        role: 'admin',
      },
      {
        id: 'G001',
        name: 'Guest',
        email: 'guest@gmail.com',
        phone: '+60 16-555 0000',
        password_hash: hashPassword('guest123'),
        role: 'user',
      },
    ],
    rooms: [
      { id: '1', name: 'Deluxe Room', type: 'Deluxe', price: 400, image: 'https://example.com/1.jpg', images: ['https://example.com/1.jpg'], capacity: 2, size: 40, description: 'A deluxe room', amenities: ['WiFi'], available: true },
      { id: '2', name: 'Standard Room', type: 'Standard', price: 200, image: 'https://example.com/2.jpg', images: ['https://example.com/2.jpg'], capacity: 1, size: 25, description: 'A standard room', amenities: ['WiFi'], available: true },
      { id: '3', name: 'Suite Room', type: 'Suite', price: 800, image: 'https://example.com/3.jpg', images: ['https://example.com/3.jpg'], capacity: 3, size: 70, description: 'A nice suite', amenities: ['WiFi', 'TV'], available: true },
      { id: '4', name: 'Penthouse', type: 'Penthouse', price: 1500, image: 'https://example.com/4.jpg', images: ['https://example.com/4.jpg'], capacity: 4, size: 120, description: 'The penthouse', amenities: ['WiFi', 'Pool'], available: true },
    ],
    bookings: [
      { id: 'B001', room_id: '1', room_name: 'Deluxe Room', user_id: 'G001', user_name: 'Guest', user_email: 'guest@gmail.com', check_in: '2026-01-01', check_out: '2026-01-03', guests: 2, total_price: 880, status: 'confirmed', payment_status: 'paid', payment_method: 'bank_transfer', created_at: '2025-12-01T00:00:00.000Z', phone: '+60 16-555 0000', special_requests: '' },
      { id: 'B002', room_id: '2', room_name: 'Standard Room', user_id: 'G001', user_name: 'Guest', user_email: 'guest@gmail.com', check_in: '2026-02-01', check_out: '2026-02-02', guests: 1, total_price: 220, status: 'pending', payment_status: 'pending', payment_method: 'cash', created_at: '2025-12-02T00:00:00.000Z', phone: '+60 16-555 0000', special_requests: '' },
      { id: 'B003', room_id: '3', room_name: 'Suite Room', user_id: 'G001', user_name: 'Guest', user_email: 'guest@gmail.com', check_in: '2026-03-01', check_out: '2026-03-04', guests: 2, total_price: 2640, status: 'pending', payment_status: 'pending', payment_method: 'cash', created_at: '2025-12-03T00:00:00.000Z', phone: '+60 16-555 0000', special_requests: '' },
      { id: 'B004', room_id: '1', room_name: 'Deluxe Room', user_id: 'G001', user_name: 'Guest', user_email: 'guest@gmail.com', check_in: '2026-04-01', check_out: '2026-04-05', guests: 2, total_price: 1760, status: 'confirmed', payment_status: 'paid', payment_method: 'bank_transfer', created_at: '2025-12-04T00:00:00.000Z', phone: '+60 16-555 0000', special_requests: '' },
      { id: 'B005', room_id: '2', room_name: 'Standard Room', user_id: 'U001', user_name: 'Admin', user_email: 'admin@hhotel.com', check_in: '2026-05-01', check_out: '2026-05-02', guests: 1, total_price: 220, status: 'confirmed', payment_status: 'paid', payment_method: 'bank_transfer', created_at: '2025-12-05T00:00:00.000Z', phone: '+60 12-345 6789', special_requests: '' },
    ],
  };
}

// ── Supabase query builder mock ───────────────────────────────────────────────
function createQueryBuilder(source, table) {
  const state = {
    operation: 'select',
    filters: [],
    negFilters: [],
    isSingle: false,
    payload: null,
  };

  function applyFilters(rows) {
    let result = rows;
    for (const [col, val] of state.filters) result = result.filter((r) => r[col] === val);
    for (const [col, val] of state.negFilters) result = result.filter((r) => r[col] !== val);
    return result;
  }

  function execute() {
    const rows = source[table] ?? [];

    if (state.operation === 'insert') {
      const items = Array.isArray(state.payload) ? state.payload : [state.payload];
      source[table] = [...rows, ...items];
      return { data: null, error: null };
    }

    if (state.operation === 'delete') {
      const toRemove = applyFilters(rows);
      source[table] = rows.filter((r) => !toRemove.includes(r));
      return { data: null, error: null };
    }

    const matched = applyFilters(rows);

    if (state.operation === 'update') {
      matched.forEach((r) => Object.assign(r, state.payload));
    }

    if (state.isSingle) {
      const data = matched[0] ?? null;
      return { data, error: data ? null : { message: 'Not found' } };
    }

    return { data: matched, error: null };
  }

  const qb = {
    select()          { if (state.operation !== 'update') state.operation = 'select'; return qb; },
    eq(col, val)      { state.filters.push([col, val]); return qb; },
    neq(col, val)     { state.negFilters.push([col, val]); return qb; },
    single()          { state.isSingle = true; return Promise.resolve(execute()); },
    insert(payload)   { state.operation = 'insert'; state.payload = payload; return Promise.resolve(execute()); },
    update(payload)   { state.operation = 'update'; state.payload = payload; return qb; },
    delete()          { state.operation = 'delete'; return qb; },
    then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
  };

  return qb;
}

// ── Register mock before importing api.js ─────────────────────────────────────
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: () => ({ from: (table) => createQueryBuilder(db, table) }),
}));

const { createApp } = await import('./api.js');
const app = createApp();

// ── Helpers ───────────────────────────────────────────────────────────────────
async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  expect(res.body.user.email).toBe(email);
  const setCookieHeader = res.headers['set-cookie'] ?? [];
  expect(setCookieHeader).toEqual(
    expect.arrayContaining([expect.stringContaining('hotel_session=')]),
  );
  const cookieLine = setCookieHeader.find((c) => c.startsWith('hotel_session=')) ?? '';
  return cookieLine.split(';')[0];
}

function authed(cookie) {
  return {
    get:    (url) => request(app).get(url).set('Cookie', cookie),
    post:   (url) => request(app).post(url).set('Cookie', cookie),
    put:    (url) => request(app).put(url).set('Cookie', cookie),
    patch:  (url) => request(app).patch(url).set('Cookie', cookie),
    delete: (url) => request(app).delete(url).set('Cookie', cookie),
  };
}

beforeEach(() => {
  resetDb();
});

// ─── 1. Registration ──────────────────────────────────────────────────────────

describe('registration', () => {
  test('signup creates a session immediately and hashes the password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'newuser@example.com',
      phone: '+60 11-222 3333',
      password: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.user.phone).toBe('+60 11-222 3333');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=')]),
    );

    const storedUser = db.users.find((u) => u.email === 'newuser@example.com');
    expect(storedUser.phone).toBe('+60 11-222 3333');
    expect(storedUser.password_hash).toBeDefined();
    expect(storedUser.password).toBeUndefined();
  });

  test('signup rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'First',
      email: 'dup@example.com',
      phone: '+60 11-222 3333',
      password: 'password123',
    });

    const second = await request(app).post('/api/auth/register').send({
      name: 'Second',
      email: 'dup@example.com',
      phone: '+60 11-222 4444',
      password: 'password456',
    });

    expect(second.status).toBe(409);
  });

  test('signup rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'shortpass@example.com',
      phone: '+60 11-222 3333',
      password: 'abc123',
    });

    expect(res.status).toBe(400);
  });
});

// ─── 2. Login ─────────────────────────────────────────────────────────────────

describe('login', () => {
  test('login sets a session cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'guest@gmail.com',
      password: 'guest123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('guest@gmail.com');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=')]),
    );
  });

  test('login rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'guest@gmail.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  test('login rejects a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });

  test('logout clears the session cookie and blocks protected endpoints afterwards', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const logoutRes = await authed(cookie).post('/api/auth/logout');

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(logoutRes.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=;')]),
    );

    const meRes = await request(app).get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});

// ─── 3. Profile ───────────────────────────────────────────────────────────────

describe('profile', () => {
  test('authenticated user can update their profile details', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).put('/api/auth/me').send({
      name: 'Updated Guest',
      email: 'updated.guest@hhotel.com',
      phone: '+60 16-555 0111',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Guest');
    expect(res.body.user.email).toBe('updated.guest@hhotel.com');
    expect(res.body.user.phone).toBe('+60 16-555 0111');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=')]),
    );

    const storedUser = db.users.find((u) => u.id === 'G001');
    expect(storedUser.name).toBe('Updated Guest');
    expect(storedUser.email).toBe('updated.guest@hhotel.com');
    expect(storedUser.phone).toBe('+60 16-555 0111');
    expect(db.bookings.filter((b) => b.user_id === 'G001')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_name: 'Updated Guest',
          user_email: 'updated.guest@hhotel.com',
        }),
      ]),
    );
  });

  test('profile update rejects duplicate emails', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).put('/api/auth/me').send({
      name: 'Jacky Chen',
      email: 'admin@hhotel.com',
      phone: '+60 12-881 0100',
    });

    expect(res.status).toBe(409);
  });
});

// ─── 4. Room booking ──────────────────────────────────────────────────────────

describe('room booking', () => {
  test('anyone can list available rooms', async () => {
    const res = await request(app).get('/api/rooms');

    expect(res.status).toBe(200);
    expect(res.body.rooms.length).toBeGreaterThan(0);
  });

  test('authenticated user can create a booking', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).post('/api/bookings').send({
      roomId: '1',
      userName: 'Jacky Chen',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guests: 2,
      phone: '+60 12-881 0100',
      specialRequests: '',
      paymentMethod: 'bank_transfer',
    });

    expect(res.status).toBe(201);
    expect(res.body.booking.room_id).toBe('1');
    expect(res.body.booking.status).toBe('confirmed');
    expect(res.body.booking.payment_status).toBe('paid');
    expect(res.body.booking.total_price).toBeGreaterThan(0);
  });

  test('counter payment bookings stay payment-pending until admin confirms payment', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).post('/api/bookings').send({
      roomId: '1',
      userName: 'Jacky Chen',
      checkIn: '2026-07-05',
      checkOut: '2026-07-06',
      guests: 1,
      phone: '+60 12-881 0100',
      specialRequests: '',
      paymentMethod: 'cash',
    });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe('pending');
    expect(res.body.booking.payment_status).toBe('pending');
    expect(res.body.booking.payment_method).toBe('cash');
  });

  test('unauthenticated users cannot create a booking', async () => {
    const res = await request(app).post('/api/bookings').send({
      roomId: '1',
      userName: 'Anonymous',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guests: 2,
      phone: '+60 12-881 0100',
    });

    expect(res.status).toBe(401);
  });

  test('booking rejects a non-existent room', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).post('/api/bookings').send({
      roomId: '999',
      userName: 'Jacky Chen',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guests: 2,
      phone: '+60 12-881 0100',
    });

    expect(res.status).toBe(404);
  });

  test('bookings endpoint only returns the signed-in user bookings for standard users', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).get('/api/bookings');

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(4);
    expect(res.body.bookings.every((b) => b.user_id === 'G001')).toBe(true);
  });

  test('user can mark their own booking as paid', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).patch('/api/bookings/B003/payment').send({ paymentStatus: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.booking.payment_status).toBe('paid');
    expect(res.body.booking.status).toBe('confirmed');
  });
});

// ─── 5. Admin features ────────────────────────────────────────────────────────

describe('admin features', () => {
  test('admin stats require an admin session cookie', async () => {
    const guestCookie = await loginAs('guest@gmail.com', 'guest123');
    const forbiddenRes = await authed(guestCookie).get('/api/admin/stats');
    expect(forbiddenRes.status).toBe(403);

    const adminCookie = await loginAs('admin@hhotel.com', 'admin123');
    const adminRes = await authed(adminCookie).get('/api/admin/stats');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.stats.totalBookings).toBeGreaterThan(0);
  });

  test('non-admin users cannot create rooms', async () => {
    const cookie = await loginAs('guest@gmail.com', 'guest123');
    const res = await authed(cookie).post('/api/rooms').send({
      name: 'Test Room',
      type: 'Suite',
      price: 300,
      image: 'https://example.com/room.jpg',
      images: ['https://example.com/room.jpg'],
      capacity: 2,
      size: 40,
      description: 'A secure test room',
      amenities: ['WiFi'],
      available: true,
    });

    expect(res.status).toBe(403);
  });

  test('admin users can create rooms', async () => {
    const cookie = await loginAs('admin@hhotel.com', 'admin123');
    const res = await authed(cookie).post('/api/rooms').send({
      name: 'Admin Suite',
      type: 'Suite',
      price: 520,
      image: 'https://example.com/admin-suite.jpg',
      images: ['https://example.com/admin-suite.jpg'],
      capacity: 2,
      size: 55,
      description: 'Created by the admin account',
      amenities: ['WiFi', 'Breakfast'],
      available: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.room.name).toBe('Admin Suite');
  });

  test('admin can view all bookings across all users', async () => {
    const cookie = await loginAs('admin@hhotel.com', 'admin123');
    const res = await authed(cookie).get('/api/bookings');

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(5);
  });

  test('admin can update a booking status', async () => {
    const cookie = await loginAs('admin@hhotel.com', 'admin123');
    const res = await authed(cookie).patch('/api/bookings/B002/status').send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('completed');
  });

  test('admin can delete a room', async () => {
    const cookie = await loginAs('admin@hhotel.com', 'admin123');
    const deleteRes = await authed(cookie).delete('/api/rooms/4');
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const roomsRes = await request(app).get('/api/rooms');
    expect(roomsRes.body.rooms.find((r) => r.id === '4')).toBeUndefined();
  });
});
