# Bus Ticket Booking System – Auth + Trip Management WIP

This monorepo hosts the AWAD project with authentication, dashboards, and in-progress trip management/search. It is not production-ready: several admin and search endpoints are still stubs, but seeding provides demo data to explore the API and UI.

## Monorepo layout
- `frontend/`: React + Vite + TypeScript + Tailwind (shadcn) SPA (protected landing/search, admin CRUD shells).
- `backend/`: NestJS + TypeORM + PostgreSQL API (auth, trips, seats, buses, routes, bookings).
- `design/`: Dashboard mockups.
- `project.md`, `week2_trip_management.md`: milestone briefs.

## Highlights (current state)
- **Auth**: Email/password + Google OAuth; AT in Zustand, RT as HttpOnly cookie with refresh retry.
- **Dashboards**: Role-aware shell with admin/user dashboard pages; data mostly mock/fallback.
- **Trip management**: Admin endpoints for creating/updating trips with bus schedule conflict checks and auto seat-status generation. Buses now carry `busType` and amenities JSON; seed data populates operators, routes, buses, seats, trips, and seat statuses.
- **Search**: Public `/api/trips/search` and `/api/trips/:id` now return seeded data (filters: from/to/date/passengers). Frontend search results use these APIs and link to a trip detail page (`/search/:id`); advanced filters still run client-side only.
- **Seat selection & booking flow**: Seat map UI (`/search/:id/seats`) renders grouped seats with state badges; selections are locked via `/api/seat-status/lock` (JWT-based lock token, DB pessimistic locking) and passed to checkout. Checkout collects passenger/contact info with validation, calculates totals, and calls `/api/booking` to convert locks into bookings; mock guest lookup/dashboard history still pending real data wiring. Real-time seat availability currently uses 30s polling until a lock is acquired (WebSocket not yet implemented).
- **Admin UX (Trips/Routes/Buses/Seats)**: Admin tables now have filters + pagination, failure toasts, and consistent nav highlighting. Trip admin endpoints are no longer shadowed (`/trips/admin`). Bus seat editor shows an interactive seat map, enforces unique seat codes per bus, and lets admins toggle seats active/inactive; deleting a bus soft-deletes its seats.
- **Booking management**: Pending bookings can be edited or cancelled; cancelling a pending booking releases seats back to available state. Booking confirmation emails are sent via Resend when contact email is provided.
- **Scheduling & payments**: Cleanup cron fixed to every 5 minutes; reminder cron runs every 15 minutes. Cleanup expires stale locks/payments/bookings; reminders send 24h/3h trip emails and respect notification preferences.
- **Metrics/monitoring scaffold**: Prometheus metrics exposed at `/api/metrics` (Prometheus format) with job counters/gauges; optional `docker-compose.monitoring.yml` spins up Prometheus (9090) + Grafana (3001) using `monitoring/prometheus.yml` (target defaults to `host.docker.internal:3000`).

## Prerequisites
- Node.js 20+ and npm
- Docker (optional) for local Postgres via `docker-compose.yml`
- PostgreSQL database reachable from the backend
- Google OAuth web client ID/secret

## Environment variables

Create `backend/.env` (or `.env.development`) with:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=supersecret
DB_NAME=blauchat_db
DB_SYNCHRONIZE=true
DB_AUTO_LOAD_ENTITIES=true
JWT_SECRET=change_me
JWT_AUDIENCE=auth:users
JWT_ISSUER=auth:issuer
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=2592000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REFRESH_COOKIE_NAME=refreshToken
REFRESH_COOKIE_MAX_AGE=2592000
ALLOWED_ORIGINS=http://localhost:5173
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

For tests, create `backend/.env.test` with safe dummy values and a throwaway DB:
```
NODE_ENV=test
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=supersecret
DB_NAME=blauchat_db_test
DB_SYNCHRONIZE=true
DB_AUTO_LOAD_ENTITIES=true
GOOGLE_CLIENT_ID=dummy-google-client-id
GOOGLE_CLIENT_SECRET=dummy-google-client-secret
JWT_SECRET=secret
JWT_AUDIENCE=auth:users
JWT_ISSUER=auth:issuer
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=2592000
REFRESH_COOKIE_NAME=refreshToken
REFRESH_COOKIE_MAX_AGE=2592000
```

## Local development
1) **Database**
- `docker compose up -d dev_db` (or point to an existing Postgres instance).

2) **Backend**
- `cd backend`
- `npm install`
- `npm run dev` (starts NestJS with global prefix `/api` and Swagger at `/docs`).
- **Seed sample data** (operators, routes, buses, seats, trips, seat statuses):
  - ensure the database exists and `.env` is set
  - `npm run seed`
  - CSV seed files live in `backend/src/seeders/data`.
- **Optional monitoring**
  - Start backend first.
  - `docker-compose -f docker-compose.monitoring.yml up -d`
  - Prometheus scrapes `/api/metrics` (adjust target in `monitoring/prometheus.yml` if needed); Grafana at http://localhost:3001 (admin/admin) with Prometheus datasource URL `http://prometheus:9090`.

3) **Frontend**
- `cd frontend`
- `npm install`
- `npm run dev` (default http://localhost:5173)

Sign up with email/password, then sign in; or use “Continue with Google”. Protected routes redirect unauthenticated users to `/signin`.

## Auth & authorization design
- Access token in Zustand (persisted) for `Authorization: Bearer ...`; refresh token is HttpOnly cookie set by the backend.
- Axios interceptor calls `/auth/refresh` on 401 (skipping auth endpoints), rotates RT cookie, and retries.
- `RoleType` enum + role guard/provider; admin-only controllers use `@Roles(RoleType.ADMIN)` (trip admin, seats). Frontend switches layouts based on `me.role`.

## API surface (selected)
- `POST /api/auth/signup` – email/password registration
- `POST /api/auth/signin` – email/username + password
- `POST /api/auth/google-authentication` – Google ID token to access/refresh tokens
- `POST /api/auth/refresh` – rotate RT cookie, return new AT
- `POST /api/auth/signout` – clear RT cookie
- `GET /api/users/me` – current user profile (requires AT)
- `POST /api/admin/trips` – create trip with bus conflict checks; auto-generates seat statuses
- `GET /api/trips/admin` / `GET /api/trips/admin/:id` – admin trip list/detail (auth + role)
- `PATCH /api/trips/admin/:id` / `PATCH /api/trips/admin/:id/cancel` – update or cancel a trip
- `GET /api/trips/search` – public trip search (from/to/date/passengers; WIP on advanced filters)
- `GET /api/trips/:id` – public trip detail including route points (pickup/dropoff) and amenities
- `GET /api/admin/buses` / `PATCH /api/admin/buses/:id` / `DELETE /api/admin/buses/:id` – manage buses (delete soft-deletes seats)
- `GET /api/admin/buses/:busId/seats` – list seats for a bus
- `POST /api/admin/buses/:busId/seats` – create a seat (duplicate seatCode blocked per bus)
- `PATCH /api/admin/buses/:busId/seats/:id` – update a seat (toggle active/type/code)
- `PATCH /api/booking/:id` – edit pending booking contact/passenger details
- `PATCH /api/booking/:id/cancel` – cancel a pending booking and release seats
- Swagger available at `/api/docs`

## Frontend routes (selected)
- `/` Landing search form (protected; redirects to `/search` with params)
- `/search` Trip search results UI (uses `/trips/search`; local filtering/pagination)
- `/search/:id` Trip detail page (uses `/trips/:id`)
- `/dashboard` Admin or user dashboard based on role
- `/trips`, `/routes`, `/buses` Admin CRUD shells (endpoints still need wiring to backend)

## Quality & tooling
- ESLint configured in both apps. Prettier, lint-staged, and Husky are not yet wired—needs adding to match rubric.
- Tests:
  - **Backend (Jest)**: `cd backend && NODE_ENV=test npm run test` (unit) or `NODE_ENV=test npm run test:e2e`. Uses `.env.test`; point DB_* to a throwaway/test database.
  - **Frontend (Vitest)**: `cd frontend && npm run test` (or `npm run test:watch`). JSDOM + Testing Library setup in `vite.config.ts` and `vitest.setup.ts`.

## Deployment
- Not yet deployed. Recommended: Vercel/Netlify for the frontend and Railway/Render for the backend, then set `VITE_API_URL`, cookie domain, and allowed origins accordingly.
