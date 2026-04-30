import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { createApp } from './api.js';

let tempDir;
let dbPath;
let app;
jest.setTimeout(15000);

/**
 * Logs in and returns the raw session cookie string, e.g. "hotel_session=<token>".
 */
async function loginAs(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  expect(res.body.user.email).toBe(email);
  const setCookieHeader = res.headers['set-cookie'] ?? [];
  expect(setCookieHeader).toEqual(
    expect.arrayContaining([expect.stringContaining('hotel_session=')]),
  );
  const cookieLine = setCookieHeader.find((c) => c.startsWith('hotel_session=')) ?? '';
  return cookieLine.split(';')[0]; // "hotel_session=<encoded-token>"
}

/** Wraps request(app) with a pre-attached session cookie. */
function authed(cookie) {
  return {
    get:    (url) => request(app).get(url).set('Cookie', cookie),
    post:   (url) => request(app).post(url).set('Cookie', cookie),
    patch:  (url) => request(app).patch(url).set('Cookie', cookie),
    delete: (url) => request(app).delete(url).set('Cookie', cookie),
  };
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'hotel-app-test-'));
  dbPath = path.join(tempDir, 'db.json');
  const sourceDb = await readFile(new URL('./data/db.json', import.meta.url), 'utf8');
  await writeFile(dbPath, sourceDb);
  app = createApp({ dbPath });
});

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

// ─── 1. Registration ──────────────────────────────────────────────────────────

describe('registration', () => {
  test('signup creates a session immediately and stores a hashed password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=')]),
    );

    const storedDb = JSON.parse(await readFile(dbPath, 'utf8'));
    const storedUser = storedDb.users.find((u) => u.email === 'newuser@example.com');
    expect(storedUser.passwordHash).toEqual(expect.any(String));
    expect(storedUser.password).toBeUndefined();
  });

  test('signup rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'First',
      email: 'dup@example.com',
      password: 'password123',
    });

    const second = await request(app).post('/api/auth/register').send({
      name: 'Second',
      email: 'dup@example.com',
      password: 'password456',
    });

    expect(second.status).toBe(409);
  });

  test('signup rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'shortpass@example.com',
      password: 'abc123',
    });

    expect(res.status).toBe(400);
  });
});

// ─── 2. Login ─────────────────────────────────────────────────────────────────

describe('login', () => {
  test('login sets a session cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'guest@hhotel.com',
      password: 'guest123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('guest@hhotel.com');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=')]),
    );
  });

  test('login rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'guest@hhotel.com',
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
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
    const logoutRes = await authed(cookie).post('/api/auth/logout');

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(logoutRes.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('hotel_session=;')]),
    );

    // Without a session cookie the protected endpoint rejects the request
    const meRes = await request(app).get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});

// ─── 3. Room booking ──────────────────────────────────────────────────────────

describe('room booking', () => {
  test('anyone can list available rooms', async () => {
    const res = await request(app).get('/api/rooms');

    expect(res.status).toBe(200);
    expect(res.body.rooms.length).toBeGreaterThan(0);
  });

  test('authenticated user can create a booking', async () => {
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
    const res = await authed(cookie).post('/api/bookings').send({
      roomId: '1',
      userName: 'Luxury Guest',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guests: 2,
      phone: '+60 12-881 0100',
      specialRequests: '',
      paymentMethod: 'bank_transfer',
    });

    expect(res.status).toBe(201);
    expect(res.body.booking.roomId).toBe('1');
    expect(res.body.booking.status).toBe('pending');
    expect(res.body.booking.totalPrice).toBeGreaterThan(0);
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
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
    const res = await authed(cookie).post('/api/bookings').send({
      roomId: '999',
      userName: 'Luxury Guest',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guests: 2,
      phone: '+60 12-881 0100',
    });

    expect(res.status).toBe(404);
  });

  test('bookings endpoint only returns the signed-in user bookings for standard users', async () => {
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
    const res = await authed(cookie).get('/api/bookings');

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(2);
    expect(res.body.bookings.every((b) => b.userId === 'G001')).toBe(true);
  });

  test('user can mark their own booking as paid', async () => {
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
    const res = await authed(cookie).patch('/api/bookings/B003/payment').send({ paymentStatus: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.booking.paymentStatus).toBe('paid');
    expect(res.body.booking.status).toBe('confirmed');
  });
});

// ─── 4. Admin features ────────────────────────────────────────────────────────

describe('admin features', () => {
  test('admin stats require an admin session cookie', async () => {
    const guestCookie = await loginAs('guest@hhotel.com', 'guest123');
    const forbiddenRes = await authed(guestCookie).get('/api/admin/stats');
    expect(forbiddenRes.status).toBe(403);

    const adminCookie = await loginAs('admin@hhotel.com', 'admin123');
    const adminRes = await authed(adminCookie).get('/api/admin/stats');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.stats.totalBookings).toBeGreaterThan(0);
  });

  test('non-admin users cannot create rooms', async () => {
    const cookie = await loginAs('guest@hhotel.com', 'guest123');
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
    expect(res.body.bookings).toHaveLength(3);
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
