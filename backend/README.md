# Backend (NestJS API)

NestJS + TypeORM API for Assignment 1. Provides email/password auth, Google OAuth verification, access/refresh token handling, and role scaffolding.

## Setup
1. Install dependencies  
   ```bash
   npm install
   ```
2. Configure environment (`.env` or `.env.development`):
   ```bash
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
3. Run database (optional helper): `docker compose up -d dev_db`
4. Start API  
   ```bash
   npm run dev   # watch mode with global prefix /api
   ```

Swagger docs: `http://localhost:3600/docs` (adds `accessToken` bearer + `refreshToken` cookie auth). API prefix: `/api`.

## Key endpoints
- `POST /api/auth/signup` – create user (email/password)
- `POST /api/auth/signin` – login with email or username + password
- `POST /api/auth/google-authentication` – exchange Google ID token for access/refresh tokens
- `POST /api/auth/refresh` – rotate RT cookie, return new AT
- `POST /api/auth/signout` – clear RT cookie
- `GET /api/users/me` – current user profile (requires AT)

## Auth & authorization
- **Tokens**: Access token signed with JWT secret; refresh token stored as HttpOnly cookie (`setRefreshCookie`). Rotation on refresh.
- **Hashing**: Bcrypt provider hashes passwords (`HashingProvider` binding).
- **Roles**: `RoleGuard` + `AccessControlProvider` implemented with role hierarchy. Currently no controllers use `@Roles(...)`—add to protect admin routes.

## Tooling
- ESLint configured (`eslint.config.mjs`). Prettier is available but Husky/lint-staged not wired yet.
- Tests: Nest scaffolded e2e test present; add auth/refresh coverage next.
