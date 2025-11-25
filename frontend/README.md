# Frontend (React + Vite)

This is the client for Assignment 1 of the Bus Ticket Booking System. It implements email/password and Google sign-in, protected routing, role-aware dashboards, and a shared layout/theme.

## Setup
1. Install dependencies  
   ```bash
   npm install
   ```
2. Create `.env` with:
   ```bash
   VITE_API_URL=http://localhost:3600/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```
3. Run dev server  
   ```bash
   npm run dev
   ```

## Features
- Auth pages with form validation and Google OAuth (`@react-oauth/google`).
- Protected routing using Zustand-persisted access token (`src/stores/auth.ts`) and `/auth/refresh` interceptor for RT cookies.
- Role-based UI: admin vs user dashboards (`src/pages/home/*`) and sidebar nav adapts to `me.role`.
- Theme system: light/dark tokens in `src/index.css`, toggle in header, layout shell with header + sidebar.

## Tooling
- ESLint configured (`eslint.config.js`). Prettier + lint-staged + Husky not yet added—see root README next steps.

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – type check + build
- `npm run lint` – ESLint
