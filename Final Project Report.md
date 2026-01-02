# Final Project Report

## System Description
Bus Ticket Booking System is a web application for intercity bus ticketing that covers the full lifecycle from trip discovery to post-booking management. Customers can search by route and date, view trip details and amenities, select seats on an interactive map, enter passenger data, select pickup/dropoff points, and pay to confirm their booking. Guest booking is supported without account registration, while authenticated users gain profile management, booking history, and notifications.

The platform provides realtime experiences via WebSocket for seat availability and notification updates to reduce double-booking risk and keep users informed about trip changes. Email flows support verification, password reset, booking confirmation, reminders, payment reminders, and cancellation notices. Admins operate a dedicated dashboard to manage routes, route points, buses, trips, bookings, passengers, and analytics reports with role-based access control.

## Team Information
- Trần Phan Thiên Bửu - 22127039
- Nguyễn Thiên Đức - 22127072
- Huỳnh Quốc Dũng - 22127077

## Database Design
Core entities:
- Users: account identity, roles, profile fields, and active status.
- Operators: bus operators and contact metadata.
- Buses: fleet details, capacity, active status, and amenities.
- Seats: per-bus seats with code and type.
- Routes: origin, destination, distance, duration, active status, optional operator link.
- Route Points: pickup/dropoff points with order and coordinates.
- Trips: scheduled trips linking a route and bus with status.
- Seat Statuses: availability per seat per trip, including locks and bookings.
- Bookings: trip, passengers, contact, status, and payment association.
- Passenger Details: per-seat passenger info and check-in state.
- Payments: payment status and amounts, linked to bookings.
- Notifications: in-app notifications with status, channel, and payload.

Relationships summary:
- Operators own buses; routes can optionally reference operators.
- Routes have route points.
- Trips reference routes and buses; seat statuses are generated for each trip.
- Bookings reference trips and seat statuses; passengers belong to bookings.
- Payments and notifications are tied to bookings and users.

Key constraints and behaviors:
- Seat statuses enforce availability with short-lived locks and booking references.
- Trip cancellations cascade to bookings and seat releases with notification emails.
- Route and bus activation flags restrict scheduling and operational usage.
- Passenger check-in is constrained by trip status and paid bookings only.

## UI/UX Design
Customer UI:
- Search-first landing, trip detail pages, seat map selection, and guided checkout.
- Guest flow supported for searching, payment, and booking lookup.
- Profile, notifications, and upcoming trips for account management.
- Accessible forms with validation feedback, toasts, and status badges.

Admin UI:
- Role-based dashboard with KPIs, charts, and recent bookings.
- CRUD workflows for routes, route points, buses, trips, operators, and admins.
- Filters, pagination, and status badges to assist daily operations.
- Guardrails that disable risky actions on cancelled/completed/in-progress trips.
- Reporting views with day/week/month grouping and CSV export.

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

## Guideline (Usage and Deployment)
Local usage:
1. Configure backend environment variables in `backend/.env`.
2. Start database and Redis using Docker Compose.
3. Install backend dependencies and run the API.
4. Install frontend dependencies and run the SPA.
5. Seed demo data using the backend seed command if needed.
6. Optional: enable monitoring stack with Prometheus and Grafana.

Internet deployment:
1. Provision a PostgreSQL database and Redis instance.
2. Configure production environment variables for backend and frontend.
3. Build and deploy the backend to a server runtime.
4. Build and deploy the frontend to a static hosting or web server.
5. Update CORS, cookie domain, and public URLs for the deployed domains.
6. Configure webhook endpoints and payment providers for production use.
