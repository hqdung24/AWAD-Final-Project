# Bus Ticket Booking System – Assignment 1 (Auth, Authorization, Layout & Dashboard)

This repository contains the first assignment for the AWAD course: implementing authentication, social login, basic authorization scaffolding, shared layout/theme, and role-aware dashboards for the Bus Ticket Booking System.

## Monorepo layout
- `frontend/`: React + Vite + TypeScript + Tailwind (shadcn) SPA.
- `backend/`: NestJS + TypeORM + PostgreSQL API.
- `design/`: Admin/User dashboard mockups (`admin-dashboard.excalidraw`, `user-dashboard.excalidraw`).
- `project.md`, `G03 - Authentication, Authorization, Layout & Dashboard.md`: project and assignment briefs.

## Implemented for Assignment 1
- **Authentication**: Email/password signup & signin with bcrypt hashing; Google OAuth client flow (`@react-oauth/google`) and server verification (`google-auth-library`).
- **Token model**: Access token stored in Zustand (persisted). Refresh token set as HttpOnly cookie and rotated on `/auth/refresh`; Axios interceptor retries on 401 with RT.
- **Authorization**: Role field on users and Nest role guard/provider implemented; dashboards and sidebar adapt to `me.role` (admin vs user). Server routes are currently public unless decorated with `@Roles` (to be tightened).
- **Layout & theme**: Global shell (`MainLayout` with header + sidebar), theme tokens with light/dark palettes, reusable UI primitives (button, card, form fields), theme toggle with localStorage persistence.
- **Dashboard UI**: Admin dashboard (summary cards, trend chart, top routes, recent bookings) and User dashboard (upcoming trips, navigation) using mock data, matching provided mockups.
- **Tooling**: ESLint configured for both apps; TypeScript strict on backend.

## Prerequisites
- Node.js 20+ and npm
- Docker (optional) for local Postgres via `docker-compose.yml`
- Google OAuth client credentials (web type) for frontend + backend verification
- PostgreSQL database for NestJS API

## Environment variables

Create `backend/.env` (or `.env.development`) with:
```
NODE_ENV=development
PORT=3600
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=supersecret
DB_NAME=nestauth_db
JWT_SECRET=change_me
JWT_AUDIENCE=auth:users
JWT_ISSUER=auth:issuer
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=2592000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REFRESH_COOKIE_NAME=refreshToken
REFRESH_COOKIE_MAX_AGE=2592000
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3600/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

For tests, create `backend/.env.test` with safe dummy values and a throwaway DB:
```
NODE_ENV=test
PORT=3600
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=test_db
S3_BUCKET=dummy-bucket
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

3) **Frontend**
- `cd frontend`
- `npm install`
- `npm run dev` (default http://localhost:5173)

Sign up with email/password, then sign in; or use “Continue with Google”. Protected routes redirect unauthenticated users to `/signin`.

## Auth & authorization design
- **Storage**: Access token in Zustand (persisted) for `Authorization: Bearer ...`; refresh token is HttpOnly cookie set by the backend.
- **Refresh flow**: Axios interceptor calls `/auth/refresh` on 401 (skipping auth endpoints), rotates RT cookie, and retries the original request.
- **Roles**: `RoleType` enum with hierarchy provider. Role guard is implemented but not yet applied to specific controllers—needs `@Roles(...)` on admin-only endpoints. Frontend switches dashboard layout based on `me.role`.

## API surface (key routes)
- `POST /api/auth/signup` – email/password registration
- `POST /api/auth/signin` – email/username + password
- `POST /api/auth/google-authentication` – Google ID token to access/refresh tokens
- `POST /api/auth/refresh` – rotate RT cookie, return new AT
- `POST /api/auth/signout` – clear RT cookie
- `GET /api/users/me` – current user profile (requires AT)

## Design system & dashboard
- Theme tokens defined in `frontend/src/index.css` and `frontend/tailwind.config.ts` with light/dark palettes, spacing, radii, gradients.
- Layout shell: `MainLayout`, `SiteHeader`, `AppSidebar` with nav adapted by role.
- Dashboard views: `frontend/src/pages/home/AdminDashboard.tsx` and `UserDashboard.tsx` align with `/design/*.excalidraw` mockups (currently using mock data).

## Quality & tooling
- ESLint configured in both apps. Prettier, lint-staged, and Husky are not yet wired—needs adding to match rubric.
- Tests:
  - **Backend (Jest)**: `cd backend && NODE_ENV=test npm run test` (unit) or `NODE_ENV=test npm run test:e2e`. Uses `.env.test`; point DB_* to a throwaway/test database.
  - **Frontend (Vitest)**: `cd frontend && npm run test` (or `npm run test:watch`). JSDOM + Testing Library setup in `vite.config.ts` and `vitest.setup.ts`.

## Deployment
- Not yet deployed. Recommended: Vercel/Netlify for the frontend and Railway/Render for the backend, then set `VITE_API_URL` and cookie domains accordingly.

## Next steps (to reach full rubric)
- Apply `@Roles` to admin-only controllers/endpoints and add client-side admin guards.
- Replace dashboard mock data with real API endpoints (bookings, routes, revenue).
- Add Prettier + lint-staged + Husky pre-commit to run lint/format; expand tests.
- Publish live deployments and update URLs here; add `NEXT_STEPS.md` checklist if required.
