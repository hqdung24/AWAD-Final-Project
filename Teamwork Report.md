# Teamwork Report

## Team Members
- Tran Phan Thien Buu (22127039)
- Nguyen Thien Duc (22127072)
- Huynh Quoc Dung (22127077)

## Collaboration Model
We followed an iterative workflow with weekly milestones and feature-driven branches. Work was split by domain (backend, frontend, admin tooling, realtime, and documentation). Each feature was implemented in a dedicated branch, reviewed informally by teammates, then merged into main once it met acceptance criteria. We prioritized end-to-end user flows first (search → booking → payment), then expanded admin operations and reporting, and finally refined realtime and notification features.

## Roles and Responsibilities
- Backend and core features: authentication, booking flow, payment integration, realtime services, notifications, data seeding, and database updates.
- Frontend customer flow: search, trip detail, seat selection, checkout, and guest flow.
- Admin tooling and reporting: dashboards, CRUD pages, reporting charts, filters, and UX improvements.
- Documentation and submission prep: README updates, report drafts, and guideline alignment.
- Cross-cutting work: bug fixes, integration, and consistency across data contracts.

## Coordination Process
- Weekly planning to prioritize features and unblock dependencies.
- Task handoffs when one feature required changes across backend and frontend.
- Shared validation on critical flows (booking, payment, notifications, and admin operations).
- Continuous updates to documentation as features stabilized.
- Lightweight code reviews via PR notes and commit feedback before merging.

## Tools and Evidence
- GitHub for version control, branches, and pull requests.
- Swagger/OpenAPI for API validation during integration.
- Local Docker Compose for database and Redis during development.
- Team reports and guideline documents for submission alignment.
- Evidence to attach: screenshots of Git commits, contributor stats, and optional Jira artifacts.

## Contribution Summary
- Tran Phan Thien Buu: Admin dashboards, reporting improvements, trip/bus/route management UX, rules for cancellations and deactivation, and documentation updates.
- Nguyen Thien Duc: Customer booking UI, trip search, trip detail, seat selection, and checkout UX integration.
- Huynh Quoc Dung: Backend architecture, auth flows, booking/payment logic, realtime updates, notifications, and e-ticket enhancements.

## Collaboration Outcomes
- A complete booking flow with seat locking and payment confirmation.
- A role-based admin console with reporting and operational safeguards.
- Realtime updates for seats and notifications to improve booking reliability.
- Clear documentation and submission materials aligned to guidelines.

## Work Breakdown by Phase
Phase 1: Foundation
- Set up project structure, auth, and core entities.
- Established seed data and baseline APIs for routes, buses, trips, and seats.

Phase 2: Customer Booking Flow
- Built search, trip detail, seat selection, and checkout pages.
- Implemented seat lock, booking creation, and guest booking.

Phase 3: Payments and Notifications
- Integrated payment provider and confirmation flow.
- Added email verification, password reset, reminders, and notifications.
- Introduced realtime updates for seat selection and notifications.

Phase 4: Admin Operations and Reporting
- Completed admin CRUD for buses, routes, trips, operators, and users.
- Added passenger check-in flows, status rules, and cancellation guards.
- Built reporting dashboards with charts and CSV export.

## Integration and Testing Approach
- Shared API contracts via Swagger and frontend service types.
- Manual integration testing of booking, payment, and admin flows.
- Regression checks after database or API changes.

## Evidence Checklist (to attach)
- Git commit screenshots with authorship.
- Contributors summary from GitHub.
- Optional Jira roadmap or task reports.
