# Bus Ticket Booking System – Auth + Trip Management WIP

This monorepo hosts the AWAD project with authentication, dashboards, and in-progress trip management/search. It is not production-ready: several admin and search endpoints are still stubs, but seeding provides demo data to explore the API and UI.

## Monorepo layout
- `frontend/`: React + Vite + TypeScript + Tailwind (shadcn) SPA (protected landing/search, admin CRUD shells).
- `backend/`: NestJS + TypeORM + PostgreSQL API (auth, trips, seats, buses, routes, bookings).
- `design/`: Dashboard mockups.
- `project.md`, `week_4_assignment.md`, `week4_self_evaluation.md`: milestone docs.

## Highlights (current state)
- **Auth**: Email/password + Google OAuth; AT in Zustand, RT as HttpOnly cookie with refresh retry; email verification + password reset emails via Resend with per-user tokens; Google sign-in now links existing email accounts and supports setting a password later.
- **Profiles**: `/account` supports profile updates, avatar upload, and password change.
- **Dashboards**: Role-aware shell with admin/user dashboard pages; data mostly mock/fallback.
- **Trip management**: Admin endpoints for creating/updating trips with bus schedule conflict checks and auto seat-status generation. Cancelling a trip sets status to cancelled, cancels pending/paid bookings, releases seats, and sends cancellation emails; reminders skip cancelled trips. Buses now carry `busType`, amenities JSON, and photo URLs; seed data populates operators, routes, buses, seats, trips, and seat statuses.
- **Search**: Public `/api/trips/search` and `/api/trips/:id` return seeded data (filters: from/to/date/passengers). Frontend search results use these APIs and link to a trip detail page (`/search/:id`); advanced filters still run client-side only.
- **Seat selection & booking flow**: Seat map UI (`/search/:id/seats`) renders grouped seats with state badges; selections are locked via `/api/seat-status/lock` and passed to checkout. Checkout collects passenger/contact info with validation, calculates totals, and calls `/api/booking` to convert locks into bookings. Seat map uses realtime socket updates plus 30s polling when unlocked, and refetches snapshots on room join.
- **Admin UX (Trips/Routes/Route Points/Buses/Seats)**: Admin tables have filters + pagination, failure toasts, and consistent nav highlighting. Routes include pickup/dropoff point CRUD with ordering and geocoordinates and no operator column; buses/routes can be activated/deactivated (bus deactivation blocks upcoming scheduled trips); trip status labels are normalized for UI, with in-progress derived by current time; trip edit/cancel actions are disabled when cancelled, completed, or in-progress; bus seat editor shows an interactive seat map, enforces unique seat codes per bus, and lets admins toggle seats active/inactive; deleting a bus soft-deletes its seats.
- **Admin auth**: Separate admin sign-in page at `/admin/login` (alias `/admin/signin`) with role check for ADMIN/MODERATOR.
- **Admin operations**: Admin accounts management, booking list + status updates (paid/cancelled/expired blocked; pending sends payment reminder; cancelled releases seats + sends email), passenger list (paid bookings only) with check-in/reset blocked on completed/archived/cancelled trips, trip sorting in admin UI, and dashboard cards including upcoming trips count.
- **Booking management**: Pending bookings can be edited or cancelled; cancelling a pending booking releases seats back to available state. Booking confirmation emails are sent via Resend when contact email is provided.
- **Scheduling & payments**: Cleanup + reminder crons run every 5 minutes. Cleanup expires stale locks/payments/bookings; reminders send 24h/3h trip emails and respect notification preferences. Trip status auto-updates every minute; route deactivation worker drains every 30s.
- **Metrics/monitoring scaffold**: Prometheus metrics exposed at `/api/metrics` (Prometheus format) with job counters/gauges; optional `docker-compose.monitoring.yml` spins up Prometheus (9090) + Grafana (3001) using `monitoring/prometheus.yml` (target defaults to `host.docker.internal:3000`).
- **Notifications**: Event-driven notifications (reminders, confirmations, incomplete booking) persisted in DB with preferences; UI supports list/read/delete and preference updates. Realtime `notification:created` events are pushed over WebSocket (`/realtime`).
- **Reports**: Admin reporting supports day/week/month grouping for revenue and cancellations; UI includes a group-by selector.

## Prerequisites
- Node.js 20+ and npm
- Docker (optional) for local Postgres via `docker-compose.yml`
- PostgreSQL database reachable from the backend
- Redis (required for refresh sessions and seat locks; available via `docker-compose.yml`)
- Google OAuth web client ID/secret

## Environment variables

Create `backend/.env` (or `.env.development`) with (see `backend/.env.example` for the full list):
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=supersecret
DB_NAME=nestauth_db
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
REFRESH_COOKIE_PATH=/auth
REFRESH_COOKIE_MAX_AGE=2592000
S3_BUCKET=your-bucket-name
REDIS_HOST=localhost
REDIS_PORT=6379
```

Optional (email, payments, CORS, and media uploads):
```
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
BASE_FRONTEND_URL=http://localhost:5173/
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL_ADRRESS=admin@example.com
ADMIN_EMAIL_NAME=Bus Ticket Admin
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key
PAYOS_WEBHOOK_URL=your-payos-webhook-url
PAYOS_BASE_URL=https://sandbox.payos.vn
COOKIE_DOMAIN=localhost
BOOKING_EDIT_CUTOFF_HOURS=3
SEAT_LOCK_DURATION=600
S3_ENDPOINT=your-s3-endpoint
PUBLIC_URL_BASE=https://cdn.example.com/
ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=your-r2-bucket
R2_MEDIA_BASE_PATH=media
REDIS_URL=redis://localhost:6379
REDIS_TTL=60
DEFAULT_AVATAR=https://cdn.example.com/defaults/default-avatar.png
DEFAULT_COVER_IMAGE=https://cdn.example.com/defaults/default-cover-image.png
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
- `docker compose up -d dev_db redis` (or point to existing Postgres/Redis instances).

2) **Backend**
- `cd backend`
- `npm install`
- `npm run dev` (starts NestJS with global prefix `/api` and Swagger at `/docs`).
- **Seed sample data** (operators, routes, buses, seats, trips, seat statuses):
  - ensure the database exists and `.env` is set
  - `npm run seed`
  - CSV seed files live in `backend/src/seeders/data` (includes `route_points.csv`).
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
- Access token in Zustand (persisted) for `Authorization: Bearer ...`; refresh token is stored as a Redis-backed session and kept in an HttpOnly cookie. Deactivated accounts cannot sign in or refresh tokens.
- Axios interceptor calls `/auth/refresh` on 401 (skipping auth endpoints), rotates the RT cookie, and retries. Refresh returns only a new access token.
- `RoleType` enum + role guard/provider; admin-only controllers use `@Roles(RoleType.ADMIN)` (trip admin, seats). Frontend switches layouts based on `me.role`.

## API surface (selected)
- `POST /api/auth/signup` – email/password registration
- `POST /api/auth/signin` – email/username + password
- `POST /api/auth/google-authentication` – Google ID token to access/refresh tokens
- `POST /api/auth/request-password-reset` – send password reset email (Resend)
- `POST /api/auth/reset-password` – reset password with email + token
- `POST /api/auth/verify-email` – verify account with email + token
- `POST /api/auth/refresh` – rotate RT cookie, return new AT
- `POST /api/auth/signout` – clear RT cookie
- `GET /api/users/me` – current user profile (requires AT)
- `PATCH /api/users/me` – update current user profile
- `PATCH /api/users/me/password` – change current user password
- `POST /api/users/me/confirm-avatar-upload` – bind uploaded avatar to user
- `POST /api/admin/trips` – create trip with bus conflict checks; auto-generates seat statuses
- `GET /api/trips/admin` / `GET /api/trips/admin/:id` – admin trip list/detail (auth + role)
- `PATCH /api/trips/admin/:id` / `PATCH /api/trips/admin/:id/cancel` – update or cancel a trip
- `GET /api/trips/search` – public trip search (from/to/date/passengers; WIP on advanced filters)
- `GET /api/trips/:id` – public trip detail including route points (pickup/dropoff) and amenities
- `GET /api/seat-status/trip/:tripId` – seat availability for a trip
- `POST /api/seat-status/lock` – lock seats for checkout
- `POST /api/admin/routes/:routeId/points` – create a pickup/dropoff point (admin)
- `GET /api/admin/routes/:routeId/points` – list route points for a route (admin)
- `PATCH /api/admin/route-points/:id` – update a route point (admin)
- `DELETE /api/admin/route-points/:id` – delete a route point (admin)
- `GET /api/admin/buses` / `PATCH /api/admin/buses/:id` / `DELETE /api/admin/buses/:id` – manage buses (delete soft-deletes seats)
- `GET /api/admin/buses/:busId/seats` – list seats for a bus
- `POST /api/admin/buses/:busId/seats` – create a seat (duplicate seatCode blocked per bus)
- `PATCH /api/admin/buses/:busId/seats/:id` – update a seat (toggle active/type/code)
- `GET /api/admin/users` / `POST /api/admin/users` / `PATCH /api/admin/users/:id` – manage admin accounts
- `PATCH /api/admin/users/:id/deactivate` – deactivate admin account
- `PATCH /api/booking/:id` – edit pending booking contact/passenger details
- `PATCH /api/booking/:id/cancel` – cancel a pending booking and release seats
- `PATCH /api/booking/:id/status` – update booking status (admin only)
- `GET /api/reports/admin` – admin reports (filters support `groupBy=day|week|month`)
- `GET /api/reports/admin/export` – export admin reports CSV (filters support `groupBy=day|week|month`)
- `GET /api/admin/trips/:tripId/passengers` – list passengers for a trip (paid bookings only)
- `PATCH /api/admin/trips/:tripId/passengers/:passengerId/check-in` – check-in passenger (blocked for completed/archived/cancelled trips)
- `PATCH /api/admin/trips/:tripId/passengers/:passengerId/check-in/reset` – reset passenger check-in (blocked for completed/archived/cancelled trips)
- `POST /api/payment` – create a PayOS payment link for a booking
- `POST /api/payment/webhook` – PayOS webhook receiver
- `POST /api/payment/webhook/confirm` – confirm PayOS webhook URL (one-time)
- `GET /api/notification` – list current user notifications (auth)
- `GET /api/notification/preferences/me` – get current user preferences (auth)
- `PATCH /api/notification/preferences` – update notification preferences (auth)
- `POST /api/notification/mark-as-read` – mark notifications as read (auth)
- `POST /api/notification/mark-all-as-read` – mark all notifications as read (auth)
- `DELETE /api/notification/:id` – delete a notification (auth)
- `POST /api/notification/delete-multiple` – delete multiple notifications (auth)
- Swagger available at `/docs`

## Database design (overview)
Key entities and relationships:
- Users have roles (ADMIN/MODERATOR/USER) and own bookings; users can receive notifications.
- Operators own buses; buses have seats and run trips.
- Routes define origin/destination and contain route points (pickup/dropoff) with ordering and coordinates.
- Trips connect a route and bus, and generate seat statuses for availability.
- Bookings reference trips, include passengers, and link to seat statuses; payments are attached to bookings.
- Notifications reference users and may relate to bookings/trips for reminders and status updates.

## System architecture (overview)
- Monorepo with a NestJS backend (REST API + WebSocket) and a React frontend (SPA).
- Backend uses PostgreSQL via TypeORM, Redis for sessions/locks/cache, and Resend for transactional emails.
- Realtime features use Socket.IO (`/realtime`) for seat and notification updates.
- Background jobs handle cleanup, reminders, and trip status updates.

## User guide (quick start)
For passengers:
- Sign up or sign in, search trips, pick seats, and complete checkout.
- Select pickup/dropoff points if available, then pay to confirm.
- Manage upcoming trips and view notifications from the dashboard.

For admins:
- Sign in at `/admin/login`, manage routes, route points, buses, trips, and bookings.
- Monitor passengers and check-in status for paid bookings.
- Use reports to review revenue/booking trends and export CSV.

## Frontend routes (selected)
- `/` Landing search form (protected with allow-guest; redirects to `/search` with params)
- `/search` Trip search results UI (uses `/trips/search`; local filtering/pagination)
- `/search/:id` Trip detail page (uses `/trips/:id`)
- `/search/:id/seats`, `/search/:id/checkout` Seat selection + checkout flow
- `/upcoming-trip` Role-based dashboard (admin dashboard or user trips)
- `/upcoming-trip/:id` Upcoming trip detail
- `/payment/:bookingId` Payment confirmation
- `/admin/login`, `/admin/signin` Admin sign-in page
- `/trips`, `/routes`, `/buses`, `/operators` Admin CRUD
- `/notifications` Notifications center + preferences
- `/bookings` Admin booking list + status updates
- `/passengers` Admin passenger list + check-in
- `/admin-users` Admin accounts management
- `/analytics`, `/reports` Admin reporting dashboards
- `/account` Profile + avatar + password change
- `/guest-booking` Guest booking lookup

## Quality & tooling
- ESLint configured in both apps. Prettier, lint-staged, and Husky are not yet wired—needs adding to match rubric.
- Tests:
  - **Backend (Jest)**: `cd backend && NODE_ENV=test npm run test` (unit) or `NODE_ENV=test npm run test:e2e`. Uses `.env.test`; point DB_* to a throwaway/test database.
  - **Frontend (Vitest)**: `cd frontend && npm run test` (or `npm run test:watch`). JSDOM + Testing Library setup in `vite.config.ts` and `vitest.setup.ts`.

## Deployment
- Not yet deployed. Recommended: Vercel/Netlify for the frontend and Railway/Render for the backend, then set `VITE_API_URL`, cookie domain, and allowed origins accordingly.
