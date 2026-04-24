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

async function loginAs(email, password) {
  const agent = request.agent(app);
  const loginResponse = await agent.post('/api/auth/login').send({ email, password });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.user.email).toBe(email);
  expect(loginResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('hotel_session=')]));
  return agent;
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

describe('hotel api auth and access control', () => {
  test('signup creates a session immediately and stores a hashed password', async () => {
    const signupResponse = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'secret123',
    });

    expect(signupResponse.status).toBe(201);
    expect(signupResponse.body.user.email).toBe('newuser@example.com');
    expect(signupResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('hotel_session=')]));

    const storedDb = JSON.parse(await readFile(dbPath, 'utf8'));
    const storedUser = storedDb.users.find((user) => user.email === 'newuser@example.com');
    expect(storedUser.passwordHash).toEqual(expect.any(String));
    expect(storedUser.password).toBeUndefined();
  });

  test('login sets a session cookie', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'guest@hhotel.com',
      password: 'guest123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.email).toBe('guest@hhotel.com');
    expect(loginResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('hotel_session=')]));
  });

  test('non-admin users cannot create rooms', async () => {
    const userAgent = await loginAs('guest@hhotel.com', 'guest123');
    const response = await userAgent
      .post('/api/rooms')
      .send({
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

    expect(response.status).toBe(403);
  });

  test('admin users can create rooms', async () => {
    const adminAgent = await loginAs('admin@hhotel.com', 'admin123');
    const response = await adminAgent
      .post('/api/rooms')
      .send({
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

    expect(response.status).toBe(201);
    expect(response.body.room.name).toBe('Admin Suite');
  });

  test('bookings endpoint only returns the signed-in user bookings for standard users', async () => {
    const userAgent = await loginAs('guest@hhotel.com', 'guest123');
    const response = await userAgent.get('/api/bookings');

    expect(response.status).toBe(200);
    expect(response.body.bookings).toHaveLength(2);
    expect(response.body.bookings.every((booking) => booking.userId === 'G001')).toBe(true);
  });

  test('admin stats require an admin session cookie', async () => {
    const userAgent = await loginAs('guest@hhotel.com', 'guest123');
    const forbiddenResponse = await userAgent.get('/api/admin/stats');

    expect(forbiddenResponse.status).toBe(403);

    const adminAgent = await loginAs('admin@hhotel.com', 'admin123');
    const adminResponse = await adminAgent.get('/api/admin/stats');

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.stats.totalBookings).toBeGreaterThan(0);
  });

  test('logout clears the session cookie and blocks protected endpoints afterwards', async () => {
    const userAgent = await loginAs('guest@hhotel.com', 'guest123');
    const logoutResponse = await userAgent.post('/api/auth/logout');

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);
    expect(logoutResponse.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('hotel_session=;')]));

    const meResponse = await userAgent.get('/api/auth/me');
    expect(meResponse.status).toBe(401);
  });
});
