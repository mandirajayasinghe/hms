# Hospital Management System (HMS)

> SLT Mobitel Internship — Acceptance Challenge

A full-stack Hospital Management System (HMS) demo application used for the SLT Mobitel internship acceptance challenge. This workspace contains a Node.js + Express backend and a React (Vite) frontend.

## Tech stack

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Dev tools:** Docker, Docker Compose, npm

## Features

- Authentication (JWT)
- Patients, Appointments, Admissions
- Billing, Pharmacy, Laboratory
- Medical Records, Users, Departments
- File uploads for attachments
- Role-based access control (RBAC)
- SQL migrations included

## Repository layout

- `hms-backend/` — Backend server (Express)
- `hms-frontend/` — Frontend app (Vite + React)

## Prerequisites

- Node.js v16+ (or compatible LTS)
- npm or yarn
- PostgreSQL (or use Docker Compose)
- Docker & Docker Compose (optional, recommended)

## Environment variables (backend)

Create a `.env` file in `hms-backend/` with the following values (names expected by the app):

- `PORT` — server port (default: `5000`)
- `NODE_ENV` — `development` or `production`
- `PGHOST` — Postgres host
- `PGPORT` — Postgres port (default: `5432`)
- `PGDATABASE` — Postgres database name
- `PGUSER` — Postgres user
- `PGPASSWORD` — Postgres password
- `JWT_SECRET` — JWT signing secret (required)
- `JWT_EXPIRES_IN` — JWT expiry (e.g. `8h`)
- `JWT_REFRESH_SECRET` — refresh token secret
- `JWT_REFRESH_EXPIRES_IN` — refresh token expiry (e.g. `7d`)
- `UPLOAD_DIR` — uploads folder (default: `uploads`)
- `MAX_UPLOAD_MB` — max upload size in MB (default: `10`)
- `CLIENT_ORIGIN` — comma-separated frontend origin(s) (default: `http://localhost:5173`)

These names are loaded from `hms-backend/src/config/env.js`.

## Setup & Run (development)

Backend

1. Open a terminal in `hms-backend/`.
2. Install dependencies:

```bash
cd hms-backend
npm install
```

3. Create `.env` with the variables above.
4. Run database migrations (SQL scripts are in `migrations/`).
5. Start the server:

```bash
npm run dev
```

Frontend

1. Open a terminal in `hms-frontend/`.
2. Install dependencies and start the dev server:

```bash
cd hms-frontend
npm install
npm run dev
```

The frontend runs by default at `http://localhost:5173`.

## Run with Docker Compose

From the `hms-backend/` directory you can use the included `docker-compose.yml` to start services (backend, db, etc.). Example:

```bash
cd hms-backend
docker compose up --build
```

Adjust environment variables used by the compose file or provide an `.env` next to it.

## API

The backend exposes a REST API under the configured server port. Key modules include:

- `/api/auth` — authentication
- `/api/patients` — patients management
- `/api/appointments` — appointment scheduling
- `/api/admissions` — admissions
- `/api/billing` — billing operations
- `/api/pharmacy`, `/api/laboratory`, `/api/medical-records`, `/api/users`, `/api/departments`

Refer to the route files in `hms-backend/src/modules/*/*Routes.js` for full endpoints and request shapes.

## Tests

No automated tests included by default. Add unit/integration tests as needed.

## Notes & Next steps

- Add a `.env.example` with variable names and example values.
- Add API documentation (OpenAPI / Postman collection).
- Add CI workflow for linting and tests.

## Contact

If this was prepared for the SLT Mobitel internship challenge, contact the author or maintainers for any clarifications.
