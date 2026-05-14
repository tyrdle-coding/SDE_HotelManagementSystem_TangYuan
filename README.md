# H Hotel Booking Web Application

This project is a full-stack Hotel Management System built for a Software Deployment and Evolution assignment. It uses a React frontend, an Express backend, Supabase Postgres, Supabase Storage for uploaded room images, automated Jest tests, Docker packaging, and a GitHub Actions CI/CD workflow.

The system allows guests to browse rooms, create accounts, sign in, make bookings, view booking details, and manage their profile. It also includes administrator pages for room management, booking management, image upload, and dashboard statistics.

## Project Overview

The application is split into two main parts:

- `frontend/` contains the React, Vite, TypeScript, and Tailwind user interface.
- `backend/` contains the Express API, authentication logic, Supabase-backed persistence, upload handling, and automated tests.

During development, the frontend runs through Vite and sends API requests to the backend through a proxy. In production-style mode, the backend can serve the built frontend from `dist`.

## Main Features

- User signup and login
- Session-based authentication with cookies
- User profile management with contact number
- Room browsing and room details
- Booking creation
- User booking history and booking details
- Bank payment recorded as paid after submission
- Pay-at-counter booking flow with admin payment confirmation
- Admin dashboard statistics
- Admin room management
- Admin booking management
- Admin feedback management for contact page inquiries
- Room image upload
- Health check endpoint at `/api/health`
- Automated backend integration tests
- GitHub Actions CI/CD for test, build, Docker image publishing, and Render deploy hooks

## Technology Used

### Frontend

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Lucide React icons

### Backend

- Node.js
- Express
- Multer for room image upload
- Cookie-based sessions
- Supabase Postgres persistence
- Supabase Storage for uploaded room images

### Testing and CI

- Jest
- Supertest
- GitHub Actions

### Current Data Storage

- Supabase Postgres stores the active application data for users, rooms, bookings, and feedback messages.
- Supabase Storage bucket `room-images` stores uploaded room image files.

## Current Architecture

### Local Development

- Frontend dev server: `http://localhost:5173`
- Backend API server: `http://localhost:3001`
- Vite proxies `/api` requests to the backend.

### Production-Style Run

- `npm run build` builds the frontend into `dist`.
- `npm start` runs `backend/api.js` using host-provided environment variables.
- Express serves API routes and can serve the built frontend.

### Data and Uploads

- App data is stored in Supabase Postgres.
- Uploaded room images are stored in Supabase Storage bucket `room-images`.
- Room records store public image URLs in `image` and `images`.

## Project Structure

```text
hotel_web_app/
|-- backend/
|   |-- api.js
|   |-- auth.js
|   |-- api.test.mjs
|   `-- data/
|       `-- db.json
|-- supabase/
|   `-- feedback_messages.sql
|-- frontend/
|   |-- app/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- api.ts
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- router.tsx
|   |   `-- types.ts
|   |-- styles/
|   |   `-- index.css
|   |-- index.html
|   |-- vite.config.mjs
|   `-- vite.config.ts
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- package.json
`-- README.md
```

## How To Run The Project

### Install Dependencies

```powershell
npm install
```

### Run In Development

```powershell
npm run dev
```

### Run Tests

```powershell
npm test
```

### Build The Frontend

```powershell
npm run build
```

### Start The App

```powershell
npm start
```

![Current Architecture](architecture.png)
