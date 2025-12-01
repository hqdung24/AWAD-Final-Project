# G04 – Admin CRUD Strategy (Mock-first, DB-ready)

## Goal
Provide basic CRUD for admin routes, buses, and trips with mock data today, and swap to real DB schemas (PostgreSQL/MongoDB/Prisma/TypeORM) later without refactoring controllers or UI.

## Approach A: No real data yet (mock provider)
- Implemented an in-memory data provider that mimics the real schema (id, operatorId, origin, destination, distanceKm, estimatedMinutes, notes).
- Routes include pickup/dropoff stops with ordering and notes; persisted in responses and UI.
- API endpoints (protected by ADMIN + Bearer):
  - Routes: `GET/POST/PATCH/DELETE /routes`
  - Trips: `GET/POST/PATCH/DELETE /trips`, `GET /trips/buses`
  - Buses: `GET/POST/PATCH/DELETE /buses`, assignments: `GET /buses/assignments/all`, `POST /buses/:id/assign`, `DELETE /buses/assignments/:id` with conflict checks.
- Seat maps: `GET /buses/:id/seat-map`, `PATCH /buses/:id/seat-map` to configure per-seat type/price/active state; mock seat maps are pre-seeded.
- Frontend admin pages:
  - `/routes` for route CRUD
  - `/trips` for trip scheduling (route + bus, departure/arrival, base price, status)
  - `/buses` for bus CRUD, bus-to-route assignments with overlap prevention, and seat map configuration (edit seat type/price/active).

## Approach B: Real data later (pluggable provider)
- Data layer is abstracted via `ROUTE_DATA_PROVIDER` interface:
  - `list`, `findById`, `create`, `update`, `delete`.
- Swap the provider binding in one place (`routes.module.ts`):
  - Now: `useClass: InMemoryRouteProvider`
  - Later: replace with a DB-backed provider (e.g., TypeORM repository/Prisma client) implementing the same interface.
- Trip management mirrors this: `TRIP_DATA_PROVIDER` defaulted to `InMemoryTripProvider`; swap to a DB-backed provider to go live without changing controllers/services/UI.
- Bus management mirrors this: `BUS_DATA_PROVIDER` defaulted to `InMemoryBusProvider`; swap to a DB-backed provider while keeping controllers/UI intact.
- Controllers/services stay unchanged; frontend keeps calling the same routes/trips APIs.

## Why this works without refactor
- Contract-first: DTOs/validators mirror the intended DB schema, so mock data behaves like real data.
- Dependency injection: provider swap is a single-line change; controllers/services/UI are unaffected.
- Frontend uses the same REST surface; only the backend provider changes when real schemas are ready. Routes UI at `/routes`; Trips UI at `/trips`; Buses UI at `/buses` (with assignment demo).
