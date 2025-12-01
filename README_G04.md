# G04 – Admin CRUD Strategy (Mock-first, DB-ready)

## Goal
Provide basic CRUD for admin routes and trips with mock data today, and swap to real DB schemas (PostgreSQL/MongoDB/Prisma/TypeORM) later without refactoring controllers or UI.

## Approach A: No real data yet (mock provider)
- Implemented an in-memory data provider that mimics the real schema (id, operatorId, origin, destination, distanceKm, estimatedMinutes, notes).
- API endpoints (protected by ADMIN + Bearer) at `/api/routes` use this provider:
  - `GET /routes`, `GET /routes/:id`
  - `POST /routes`
  - `PATCH /routes/:id`
  - `DELETE /routes/:id`
- Frontend admin routes page (`/routes`) calls these endpoints and shows a CRUD table with inline create/edit/delete.
- Trip management also uses an in-memory provider: `/api/trips` and `/api/trips/buses` for listing/creating/updating/deleting trips with bus assignment and schedule conflict checks.

## Approach B: Real data later (pluggable provider)
- Data layer is abstracted via `ROUTE_DATA_PROVIDER` interface:
  - `list`, `findById`, `create`, `update`, `delete`.
- Swap the provider binding in one place (`routes.module.ts`):
  - Now: `useClass: InMemoryRouteProvider`
  - Later: replace with a DB-backed provider (e.g., TypeORM repository/Prisma client) implementing the same interface.
- Trip management mirrors this: `TRIP_DATA_PROVIDER` defaulted to `InMemoryTripProvider`; swap to a DB-backed provider to go live without changing controllers/services/UI.
- Controllers/services stay unchanged; frontend keeps calling the same routes/trips APIs.

## Why this works without refactor
- Contract-first: DTOs/validators mirror the intended DB schema, so mock data behaves like real data.
- Dependency injection: provider swap is a single-line change; controllers/services/UI are unaffected.
- Frontend uses the same REST surface; only the backend provider changes when real schemas are ready. Routes UI is at `/routes`; Trips UI is at `/trips`.
