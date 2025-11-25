## Assignment 1 Self‑Evaluation (Authentication, Authorization, Layout & Dashboard)

### Context
- Frontend: React + Vite + TypeScript with Tailwind/shadcn in `frontend/src`. Routing guarded via `ProtectedRoute`/`PublicRoute`, session hydration via `SessionSync`/`useSession`, and persisted access token store in `frontend/src/stores/auth.ts`.
- Backend: NestJS + TypeORM/Postgres (`backend/src`). Global `MyAuthGuard` defaults to bearer JWT; refresh token is HttpOnly cookie via `setRefreshCookie`. Dashboard endpoints are role-protected.
- Design mockups: `/design/admin-dashboard.excalidraw` and `/design/user-dashboard.excalidraw`.

### Requirement-by-requirement check
- **Authentication**
  - Email/password signup & signin with DTO validation and bcrypt hashing (`backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/providers/sign-in.provider.ts`, `backend/src/modules/users/providers/users.repository.ts`).
  - Google login wired on client and verified server-side (`frontend/src/components/auth/*`, `backend/src/modules/auth/social/google-authentication.service.ts`).
  - Token model: AT in persisted Zustand store; RT in HttpOnly cookie with rotation on `/auth/refresh` and Axios retry (`frontend/src/lib/http.ts`, `backend/src/modules/auth/auth.controller.ts`). Session hydration via `SessionSync`/`useSession`.
  - Private routes redirect unauthenticated users to `/signin` (`frontend/src/routes/ProtectedRoute.tsx`); signed-in users blocked from auth pages via `PublicRoute`.
- **Authorization**
  - Role field on users and guard infrastructure present (`backend/src/modules/auth/guard/role-based.guard.ts`, `backend/src/modules/auth/providers/access-control.provider.ts`).
  - Dashboard routes now enforce roles: `/dashboard/admin` requires `ADMIN`; `/dashboard/user` allows `USER|ADMIN` (`backend/src/modules/dashboard/dashboard.controller.ts`).
  - UI switches dashboards/sidebar based on `me.role` (`frontend/src/pages/home/HomePage.tsx`, `frontend/src/components/app-sidebar.tsx`); client-side blocking is limited to view selection and 403 handling.
- **Layout & Design System**
  - Theme tokens for light/dark, spacing, gradients (`frontend/src/index.css`, `frontend/tailwind.config.ts`), persisted theme toggle (`frontend/src/providers/ThemeProvider.tsx`, `frontend/src/components/theme/ThemeToggle.tsx`).
  - Reusable layout primitives (`MainLayout`, grid/stack/section) and shadcn UI kit (`frontend/src/components/ui/*`, `frontend/src/components/ui/field.tsx`).
- **Dashboard UI & Implementation**
  - Admin/User dashboards with summary cards, trend chart, tables/lists, navigation sidebar (`frontend/src/pages/home/*`).
  - Backend now serves real data when tables exist: `booking`/`trip`/`route`/`payment`/`seat_status` queried via raw SQL with table-existence checks and fallbacks (`backend/src/modules/dashboard/dashboard.service.ts`). User endpoint filters by active user id. Frontend handles 403s with friendly states.
  - No admin-only action buttons yet; actions are still view-level differences.
- **Developer Tooling**
  - ESLint configured frontend/backend; backend has Prettier config. Tests: frontend Vitest for `ProtectedRoute`, backend e2e covers dashboard auth 401.
  - Prettier/lint-staged/Husky not wired; broader test coverage pending.
- **Deployment & Documentation**
  - Local/dev setup documented; no live deployment URL yet. `NEXT_STEPS.md` present.

### Overall assessment
- Auth flows work (email/password + Google, AT/RT rotation, guarded routing). Dashboard routes now enforce roles and serve DB-backed data when tables exist, with safe fallbacks.
- Client/UI still lacks admin-only action gating beyond view changes; actions/widgets are role-differentiated but not enforced beyond dashboard access. Tooling (hooks/Prettier/shared config) and deployments remain gaps.

### Next steps to reach rubric parity
1. Add TypeORM entities/repos for booking/trip/route/payment/seat_status and replace raw SQL with typed queries; expand admin-only actions/widgets and client guards.
2. Extend tests: backend auth/refresh/dashboard happy/fail cases; frontend auth + dashboard rendering/error states.
3. Add shared Prettier config, lint-staged, Husky to run ESLint/Prettier on commit.
4. Deploy FE/BE (e.g., Vercel/Netlify + Railway/Render) and document live URLs + env notes.
5. Keep README/NEXT_STEPS updated with current flows, env vars, and role enforcement details.
