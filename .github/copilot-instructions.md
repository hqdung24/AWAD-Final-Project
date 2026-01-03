# Bus Booking System - AI Coding Agent Instructions

## Architecture Overview
Monorepo with NestJS backend + React/Vite frontend for a bus ticket booking platform. Not production-ready; serves as academic project demonstrating auth, realtime seat locking, booking management, and payments.

**Backend**: `backend/` - NestJS + TypeORM + PostgreSQL + Redis + Socket.IO  
**Frontend**: `frontend/` - React + TypeScript + Vite + Tailwind + shadcn/ui + Zustand

## Critical Developer Workflows

### Environment Setup
- **Backend**: Create `backend/.env.development` (see `backend/.env.example`)
- **Frontend**: Create `frontend/.env` with `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`
- **Database**: `docker compose up -d dev_db redis` spins up Postgres + Redis
- **Seeding**: `cd backend && npm run seed` populates operators, routes, buses, trips, users

### Running Services
```bash
# Backend (port 3000, API prefix /api)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

### Testing
```bash
# Backend tests (requires .env.test with separate DB)
cd backend && npm run test:e2e
```

## Module Structure & Patterns

### Backend Module Organization
All modules follow `backend/src/modules/{module-name}/` structure:
- **Entity**: `entities/{module-name}.entity.ts` - TypeORM with snake_case columns via `SnakeNamingStrategy`
- **Repository**: `{module-name}.repository.ts` - Repository pattern, injected into services
- **Service**: `{module-name}.service.ts` - Business logic
- **Controller**: `{module-name}.controller.ts` - REST endpoints with Swagger decorators
- **DTOs**: `dto/create-*.dto.ts`, `dto/update-*.dto.ts` - class-validator validation
- **Providers**: `providers/*.provider.ts` - Specialized logic (e.g., `seat-lock.provider.ts`, `booking-email.provider.ts`)

Key modules: `auth`, `booking`, `trip`, `seat-status`, `payment`, `notification`, `realtime`, `schedule`, `users`

### Authentication & Authorization
- **Guards**: Custom `MyAuthGuard` (in `auth/auth/auth.guard.ts`) combines `AccessTokenGuard` and `RoleGuard`
- **Decorators**: 
  - `@Auth(AuthType.Bearer)` - Require JWT access token (default if no decorator)
  - `@Auth(AuthType.None)` - Public endpoint
  - `@Roles(RoleType.Admin)` - Require specific role (admin, user, guest)
- **Token Flow**: 
  - Access token in Zustand (`useAuthStore`) + Authorization header
  - Refresh token as HttpOnly cookie (`refreshToken`), rotated via `/api/auth/refresh`
  - Frontend `http.ts` has axios interceptor for auto-refresh on 401

### Event-Driven Architecture
Uses `@nestjs/event-emitter` for cross-module communication:
- **Event**: `notification.create` - Emitted from booking/payment modules
  - Payload: `{ userId, type: NotificationType, payload: {...} }`
  - Listener: `NotificationService.handleNotificationCreate()` creates DB record
- **Cron Jobs**: `ScheduleService` runs cleanup (every 5min) and reminders (every 15min)
  - See `backend/src/modules/schedule/schedule.service.ts`

### Realtime Communication (Socket.IO)
- **Namespace**: `/realtime` (see `backend/src/modules/realtime/realtime.gateway.ts`)
- **Rooms**: `trip:{tripId}` for seat updates
- **Events**:
  - Client emits: `joinTripRoom`, `selectSeat`, `releaseSeat`
  - Server broadcasts: `seatUpdated` (to room), `seatSelected`, `seatReleased`
- **Frontend**: `SocketProvider` in `frontend/src/providers/SocketProvider.tsx` manages connection
- **Pattern**: Frontend combines socket updates with 30s polling (`useEffect` timers) for resilience

### Seat Locking Mechanism
Critical pattern to prevent double-booking:
1. User selects seats → POST `/api/seat-status/lock` with `{ trip_id, seat_ids }`
2. Backend (`SeatLockProvider`) checks Redis cache, creates 5-min lock
3. Response includes `lock_token` + `locked_until` timestamp
4. Frontend passes `lock_token` to checkout → POST `/api/booking` validates token
5. On payment success, seats move from `locked` → `booked`
6. **Cleanup**: `ScheduleService.releaseExpiredLocks()` runs every 5min to expire stale locks

See `frontend/SEAT_LOCK_FRONTEND_GUIDE.md` and `backend/src/modules/seat-status/providers/seat-lock.provider.ts`

## Frontend Patterns

### State Management
- **Zustand Stores**: `frontend/src/stores/auth.ts` (access token + role), `user.ts`
  - Persist to localStorage via `persist` middleware
- **React Query**: `@tanstack/react-query` for server state (see `lib/queryClient.ts`)
  - Query keys pattern: `['trips', tripId]`, `['bookings', userId]`

### Routing & Protection
- **Router**: React Router v7 in `frontend/src/App.tsx`
- **Protected Routes**: `ProtectedRoute` component checks `useAuthStore` accessToken
- **Role-based UI**: Admin routes (`/admin/*`) check `role === 'admin'`

### Form Validation
- **Library**: `react-hook-form` + `zod` schemas in `frontend/src/schemas/`
- **Example**: Checkout form validates passenger details with `PassengerSchema`

### API Client
- **Axios Instance**: `frontend/src/lib/http.ts` with base URL from `VITE_API_URL`
- **Interceptor**: Automatically attaches access token and handles 401 refresh retry
- **Services**: `frontend/src/services/*` wrap API calls (e.g., `seatStatusService.ts`)

## Database & Seeding

### TypeORM Configuration
- **Naming**: `SnakeNamingStrategy` converts camelCase → snake_case (e.g., `userId` → `user_id`)
- **Entities**: All in `backend/src/modules/*/entities/*.entity.ts`
- **Relations**: Use `@ManyToOne`, `@OneToMany` with `{ eager: false }` to avoid circular loads
- **Synchronize**: `DB_SYNCHRONIZE=true` in dev (do NOT use in prod)

### Seeding Data
- **Script**: `backend/src/seeders/seed.ts` reads CSV files from `backend/src/seeders/data/`
- **Order**: operators → routes → buses → seats → trips → seat_statuses → users → payment_methods
- **Command**: `npm run seed` (Windows: `npm run seed:win`)

## Integration Points

### Payment (PayOS)
- **Provider**: `backend/src/modules/payment/providers/payment.service.ts`
- **Flow**: Create payment link → User pays → Webhook (`POST /api/payment/webhook`) updates booking
- **Guard**: `PaymentWebhookGuard` validates webhook signature
- **Config**: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` in `.env`

### Email (Resend)
- **Providers**: `BookingEmailProvider`, `PaymentEmailProvider` in respective modules
- **Templates**: Inline HTML in provider methods (booking confirmation, reminders)
- **Config**: `RESEND_API_KEY`, `ADMIN_EMAIL_ADDRESS` in `.env`

### Media Storage (Cloudflare R2)
- **Provider**: `backend/src/modules/media/providers/r2-storage.provider.ts` using AWS SDK v3
- **Upload**: `POST /api/media/upload` (multipart/form-data)
- **Config**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `PUBLIC_URL_BASE`

### Monitoring (Optional)
- **Prometheus**: `docker-compose.monitoring.yml` starts Prometheus (9090) + Grafana (3001)
- **Metrics**: `GET /api/metrics` endpoint exposes `prom-client` metrics
- **Config**: `monitoring/prometheus.yml` (target: `host.docker.internal:3000`)

## Common Pitfalls

1. **Missing `.env` files** - Backend/frontend require separate env configs; seeding/tests need `.env.test`
2. **Port conflicts** - Default ports: backend 3000, frontend 5173, Postgres 5432, Redis 6379
3. **Circular imports** - Use `@/` path alias (tsconfig) to avoid relative path hell
4. **Entity relations** - Always specify `{ eager: false }` to prevent circular loads; use repository joins explicitly
5. **Validation pipes** - Global `ValidationPipe` with `whitelist: true` strips unknown properties
6. **Cookie domain** - Ensure `ALLOWED_ORIGINS` matches frontend URL for CORS + cookies
7. **Seat lock expiry** - Frontend must respect `locked_until` timestamp; backend cleanup is eventual (5min)
8. **TypeORM snake_case** - Access entity properties with camelCase in code, but DB columns are snake_case

## Key Files Reference
- Architecture docs: `README.md`, `backend/MODULES_SETUP_GUIDE.md`, `NOTIFICATION_EMIT_AUDIT.md`
- Swagger spec: `backend/openapi.json` (regenerate: `npm run swagger:json`)
- Frontend guides: `frontend/SEAT_LOCK_FRONTEND_GUIDE.md`
- Design mockups: `design/*.excalidraw`
