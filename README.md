# H Hotel Booking Web Application

This project is a full-stack Hotel Management System built for a Software Deployment and Evolution assignment. It uses a React frontend, an Express backend, local JSON data storage, automated Jest tests, and a GitHub Actions CI workflow.

The system allows guests to browse rooms, create accounts, sign in, make bookings, view booking details, and manage their profile. It also includes administrator pages for room management, booking management, image upload, and dashboard statistics.

## Project Overview

The application is split into two main parts:

- `frontend/` contains the React, Vite, TypeScript, and Tailwind user interface.
- `backend/` contains the Express API, authentication logic, upload handling, automated tests, and local JSON data.

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
- Room image upload
- Health check endpoint at `/api/health`
- Automated backend integration tests
- GitHub Actions CI for test and build verification

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
- Local JSON file persistence

### Testing and CI

- Jest
- Supertest
- GitHub Actions

### Current Data Storage

- Local JSON file: `backend/data/db.json`

Supabase Postgres is part of the intended DevOps/database plan, but the current working implementation still uses `backend/data/db.json`.

## DevOps Tool Selection

| Pipeline Stage | Selected Tools | Cost | Justification |
| --- | --- | --- | --- |
| Source Control | GitHub | Free | Hosts the code repository and integrates natively with GitHub Actions for CI/CD workflows and pull request-based code review. |
| CI / Build | GitHub Actions | Free | Automates install, test, and build steps on every push or pull request. YAML workflows are stored in the repository as configuration as code. |
| Testing | Jest and Supertest | Free | Unit and integration tests run inside GitHub Actions. Jest was chosen for fast execution, built-in mocking support, and strong React/Node ecosystem support. |
| Hosting - Staging | Render | Free tier / Hobby Plan | Planned staging host with auto-deploy from GitHub, HTTPS support, health checks, and rollback options. |
| Hosting - Fallback | Railway / Fly.io | Trial / Paid tiers | Secondary hosting options if Render is unavailable. Railway provides simple deployment flows, while Fly.io supports Docker-native deployments. |
| Database | Supabase Postgres | Free tier, 500 MB | Planned managed Postgres database for guest records, rooms, bookings, and billing information without manual server administration. |
| Containerization | Docker | Free for local development | Planned packaging method to keep application behaviour consistent across development, staging, and production environments. |
| Monitoring | UptimeRobot | Free, 50 monitors | Planned production monitoring tool that polls the production URL and sends alerts when downtime is detected. |
| Container Registry | Docker Hub | Free | Planned storage for Docker images built by the CI pipeline. Tagged images support rollback and environment-specific deployment. |
| Secret Management | GitHub Secrets | Free | Stores API keys, tokens, database URLs, and deployment credentials outside the source code. |
| Code Review | GitHub Pull Requests | Free | Supports peer review before merging, with branch protection rules requiring passing CI checks. |

## Project Scope and Exclusions

### Project Scope

This project focuses on using a DevOps pipeline to create, launch, and automate a Hotel Management System. The in-scope work includes:

- Web application development using Node.js and React for room reservations, guest management, account features, and billing status tracking.
- Version control management through GitHub with a branching strategy using feature, staging, and main branches.
- CI/CD pipeline implementation using GitHub Actions for dependency installation, test execution, build verification, Docker image building, and environment-specific deployment.
- Automated testing using Jest and Supertest for backend integration flows and core application behaviour.
- Containerization using Docker and Docker Compose to support consistent local, staging, and production environments.
- Deployment to three environments: local development, staging, and production.
- Database integration plan using Supabase Postgres for guest records, room details, bookings, and billing information.
- Monitoring and availability checks using UptimeRobot.
- Security practices using GitHub Secrets, role-based access control, and backend input validation.

### Project Exclusions

The following items are out of scope for this project:

- Advanced security implementations such as compliance certification, sophisticated encryption techniques, and penetration testing.
- High-scale production infrastructure such as load balancing, horizontal auto-scaling, and enterprise infrastructure management.
- Mobile application development.
- Third-party payment gateway integration. Payment status is recorded internally only and no real transaction is processed.
- Manual deployment as a long-term workflow. Deployment is intended to be automated through CI/CD.
- Extensive UI/UX research or large-scale redesign beyond the functional hotel booking interface.
- Long-term maintenance, ongoing software updates, and production support after project delivery.

## Project Deliverables

The expected project deliverables are:

- Fully functional web application supporting room reservations, guest management, internal billing/payment status, profile management, and admin features.
- GitHub repository containing source code, CI/CD workflows, environment documentation, and project history.
- GitHub Actions CI/CD pipeline for test execution and build verification, with future deployment automation.
- Docker configuration for consistent local and deployment environments.
- Staging and production environments hosted from controlled branches.
- Documented Jest and Supertest test cases with passing CI run evidence.
- Monitoring configuration using UptimeRobot for production availability checks.

## Current Implementation Status

Already completed in this repository:

- React frontend pages for guests and administrators.
- Express backend API.
- User registration and login.
- Plain-password local development storage as requested for this assignment stage.
- Profile page with contact number support.
- Room listing, room details, and admin room management.
- Booking creation and booking history.
- Booking ID standardisation using the `B001` format.
- Bank payment flow recorded as paid and confirmed.
- Pay-at-counter flow recorded as pending until admin confirms payment.
- Admin booking management with pending, confirmed, completed, and cancelled states.
- Room image upload endpoint and `backend/uploads` storage.
- Footer and contact details aligned to Kuching.
- Login, signup, and loading screen image updates.
- Automated backend tests in `backend/api.test.mjs`.
- GitHub Actions CI workflow for install, test, and build.
- Production build command using Vite native config loading.

Not completed yet:

- Supabase Postgres migration.
- Supabase Auth integration.
- Dockerfile and Docker Compose setup.
- Docker Hub image publishing.
- Render staging deployment.
- Railway / Fly.io fallback deployment.
- UptimeRobot monitoring setup.
- Full automated CD deployment after CI passes.

## Current Architecture

### Local Development

- Frontend dev server: `http://localhost:5173`
- Backend API server: `http://localhost:3001`
- Vite proxies `/api` requests to the backend.

### Production-Style Run

- `npm run build` builds the frontend into `dist`.
- `npm start` runs `backend/api.js`.
- Express serves API routes and can serve the built frontend.

### Data and Uploads

- App data is stored in `backend/data/db.json`.
- Uploaded room images are stored in `backend/uploads`.

## Project Structure

```text
hotel_web_app/
|-- backend/
|   |-- api.js
|   |-- auth.js
|   |-- api.test.mjs
|   |-- data/
|   |   `-- db.json
|   `-- uploads/
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

## Useful URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`

## Simple Summary

The hotel booking system currently works locally with a React frontend, Express backend, JSON persistence, admin features, room image upload, automated tests, and GitHub Actions CI. The remaining DevOps work is to connect the planned cloud database, add Docker, deploy to staging and production, publish container images, and configure monitoring.

![Current Architecture](download.png)
