# G04 – Admin CRUD Strategy (Mock-first, DB-ready)

## Goal
Provide basic CRUD for admin routes in the dashboard that works today with mock data, and can be swapped to real DB schemas (PostgreSQL/MongoDB/Prisma/TypeORM) later without refactoring controllers or UI.

## Approach A: No real data yet (mock provider)
- Implemented an in-memory data provider that mimics the real schema (id, operatorId, origin, destination, distanceKm, estimatedMinutes, notes).
- API endpoints (protected by ADMIN + Bearer) at `/api/routes` use this provider:
  - `GET /routes`, `GET /routes/:id`
  - `POST /routes`
  - `PATCH /routes/:id`
  - `DELETE /routes/:id`
- Frontend admin dashboard calls these endpoints and shows a CRUD table with inline create/edit/delete.

## Approach B: Real data later (pluggable provider)
- Data layer is abstracted via `ROUTE_DATA_PROVIDER` interface:
  - `list`, `findById`, `create`, `update`, `delete`.
- Swap the provider binding in one place (`routes.module.ts`):
  - Now: `useClass: InMemoryRouteProvider`
  - Later: replace with a DB-backed provider (e.g., TypeORM repository/Prisma client) implementing the same interface.
- Controllers/services stay unchanged; frontend keeps calling the same routes.

## Why this works without refactor
- Contract-first: DTOs/validators mirror the intended DB schema, so mock data behaves like real data.
- Dependency injection: provider swap is a single-line change; controllers/services/UI are unaffected.
- Frontend uses the same REST surface; only the backend provider changes when real schemas are ready.
