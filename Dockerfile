# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
# Installs all dependencies (incl. dev) and builds the Vite frontend.
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies based on the lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source needed to build
COPY tsconfig.json ./
COPY frontend ./frontend
COPY backend ./backend

# Produces frontend/dist
RUN npm run build


# ---------- Runtime stage ----------
# Slim production image. The same image is used in dev (via docker compose),
# staging, and production - environment variables control behavior.
FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the backend source and built frontend from the builder stage
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Ensure writable directories for uploads and the legacy JSON db.
# (Postgres will replace db.json, but the path still needs to exist
# while the migration is in flight.)
RUN mkdir -p /app/backend/uploads /app/backend/data \
 && addgroup -S app \
 && adduser  -S app -G app \
 && chown -R app:app /app

USER app

EXPOSE 3001

# Uses Node 22's global fetch - no extra packages required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/api.js"]
