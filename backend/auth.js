import crypto from 'node:crypto';

const DEFAULT_SECRET = 'hotel-dev-secret';
const ACCESS_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function getAuthSecret() {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

function encodeToken(payload, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  const body = Buffer.from(JSON.stringify({ ...payload, exp: expiresAt })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url');

  return `${body}.${signature}`;
}

function decodeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, passwordHash) {
  return hashPassword(password) === passwordHash;
}

export function createSessionToken(user) {
  return encodeToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'session',
    },
    ACCESS_TOKEN_TTL_MS,
  );
}

export function verifySessionToken(token) {
  const payload = decodeToken(token);
  if (!payload || payload.type !== 'session') {
    return null;
  }
  return payload;
}
