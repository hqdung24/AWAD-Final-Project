# Final project Self-assessment report

Team: 22127039 - 22127072 - 22127077

GitHub repo URL: [https://github.com/hqdung24/AWAD-Final-Project](https://github.com/hqdung24/AWAD-Final-Project)

# **TEAM INFORMATION**

| Student ID | Full name | Git account | Contribution | Contribution percentage (100% total) | Expected total points | Final total points |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 22127039 | Trần Phan Thiên Bửu | [https://github.com/TonyTran2902](https://github.com/TonyTran2902) | \<List of tasks done by student 1\> | 33% |  |  |
| 22127072 | Nguyễn Thiên Đức | [https://github.com/duccodon](https://github.com/duccodon) | \<List of tasks done by student 2\> | 33% |  |  |
| 22127077 | Huỳnh Quốc Dũng | [https://github.com/hqdung24](https://github.com/hqdung24) | \<List of tasks done by student 3\> | 34% |  |  |

# **FEATURE LIST**

**Project:** Bus Ticket Booking System - Intercity Bus Ticketing Platform

Students must input minus points to every uncompleted feature in the SE column.

\*SE: Self-evaluation

\*TR: Teacher review

| ID | Features | Grade |  |  | Notes |
| ----- | :---- | ----- | :---- | :---- | :---- |
|  |  | **Point** | **SE\*** | **TR\*** |  |
| **1** | **Overall requirements** |  |  |  |  |
|  | User-centered design | \-5 |  |  | Built with user experience in mind. Focus on solving real booking problems: seamless trip search, interactive seat selection, efficient booking flow, and convenient payment options |
|  | Database design | \-1 |  |  | Database with tables: users, routes, buses, trips, seats, bookings, booking_details, payments, ratings, notifications |
|  | Database mock data | \-1 |  |  | Sample routes, buses, trips, seats, and test bookings |
|  | Website layout | \-2 |  |  | Two layouts: Customer booking interface and Admin dashboard |
|  | Website architect | \-3 |  |  | Based on MVC architecture. Clear separation of concerns with controllers, services, repositories. Client-side validation, Input validation, Business rule validation |
|  | Website stability and compatibility | \-4 |  |  | Responsive design, tested on Chrome, Safari, Firefox, and Edge |
|  | Document | \-2 |  |  | Clear documentation for developers and users: setup guide, API endpoints (Swagger/OpenAPI), database design, system architecture, user guide |
|  | Demo video | \-5 |  |  | Video demonstrating all features: user signup, trip search, seat selection, booking, payment, e-ticket, admin management |
|  | Publish to public hosts | \-1 |  |  | Deployed to a public hosting service (AWS/GCP/Azure) with accessible URL |
|  | Development progress is recorded in Github | \-7 |  |  | Git history with meaningful commits, branches for features, pull requests |
| **2** | **Guest features (Trip Search & Booking)** |  |  |  |  |
|  | Home page (Search page) | \-0.25 |  |  | Trip search page with origin, destination, date selection |
|  | Search autocomplete | \-0.25 |  |  | Autocomplete suggestions for route/station selection |
|  | View list of available trips | \-0.25 |  |  | Display available trips with departure time, arrival time, price, available seats |
|  | Filter trips by |  |  |  | A combination of the criteria |
|  | › Departure time | \-0.25 |  |  | Filter trips by departure time range |
|  | › Bus type | \-0.25 |  |  | Filter by bus type (Sleeper, Seater, VIP, etc.) |
|  | › Price range | \-0.25 |  |  | Filter by ticket price range |
|  | Sort trips by price, departure time | \-0.25 |  |  | Sort available trips by price or departure time |
|  | Trip paging | \-0.75 |  |  | Pagination for trip results. URL updated on search/filter/paging |
|  | View trip details | \-0.25 |  |  | Trip detail page with full route info, stops, amenities, bus details |
|  | View seat availability | \-0.25 |  |  | Display seat map with available/booked status |
|  | Show related trips | \-0.25 |  |  | Suggest alternative trips on same route or similar dates |
|  | View list of trip reviews | \-0.5 |  |  | Customer reviews and ratings for bus operators with pagination |
|  | Add a new trip review | \-0.25 |  |  | Logged-in customers can review trips they completed |
|  | Seat Selection |  |  |  |  |
|  | › Interactive seat map | \-0.25 |  |  | Visual seat selection with real-time availability updates |
|  | › View and update selected seats | \-0.5 |  |  | Seat selection summary with prices. Update selection with auto-update totals |
|  | Booking and payment |  |  |  |  |
|  | › Guest checkout | \-0.25 |  |  | Allow booking without account registration |
|  | › Input passenger details | \-0.25 |  |  | Passenger name, phone, email, ID number |
|  | › Select pickup/dropoff points | \-0.25 |  |  | Choose pickup and dropoff locations along the route |
|  | › View booking summary | \-0.25 |  |  | Booking confirmation with trip details, seats, total price |
|  | › Process payment | \-0.25 |  |  | Payment gateway integration |
|  | › Receive e-ticket | \-0.25 |  |  | E-ticket generation and delivery via email |
|  | AI Chatbot |  |  |  |  |
|  | › AI-powered trip search | \-0.25 |  |  | OpenAI-powered chatbot for trip search assistance |
|  | › AI booking assistance | \-0.25 |  |  | Chatbot helps users complete booking flow |
|  | Real-time features |  |  |  |  |
|  | › Real-time seat locking | \-0.5 |  |  | Concurrent booking handling with seat locking mechanism |
|  | › WebSocket real-time updates | \-0.5 |  |  | Socket.IO for real-time: seat availability, booking confirmations, trip status notifications |
|  | Payment system integration | \-0.5 |  |  | Payment gateway integration (Stripe, PayOS, VNPay, MoMo, etc.) |
|  | Fulltext search | \-0.25 |  |  | Fulltext search for route/station search |
|  | E-ticket with QR code | \-0.25 |  |  | Generate e-tickets with QR code for check-in |
|  | Email notifications | \-0.25 |  |  | Email notifications for booking confirmations and reminders |
| **3** | **Authentication and authorization** |  |  |  |  |
|  | Use a popular authentication library | \-1 |  |  | Passport.js with JWT strategy |
|  | Registration (Customer Signup) | \-0.5 |  |  | Customer registration with email/phone/password. Real-time email availability check |
|  | Verify user input: password complexity, full name | \-0.25 |  |  | Password rules, required fields validation |
|  | Account activation by email | \-0.25 |  |  | Email verification link sent on signup |
|  | Social Sign-up/Sign-In | \-0.25 |  |  | Google/Facebook OAuth integration |
|  | Login to the website | \-0.25 |  |  | JWT-based authentication for admin/users |
|  | Authorize website features | \-0.25 |  |  | Role-based access control (Admin, Customer) |
|  | Forgot password by email | \-0.25 |  |  | Password reset via email link |
| **4** | **Features for logged-in users (Customers)** |  |  |  |  |
|  | Update user profile | \-0.25 |  |  | Customer can update name, phone, preferences |
|  | Verify user input | \-0.25 |  |  | Input validation on profile updates |
|  | Update the user's avatar | \-0.25 |  |  | Profile photo upload |
|  | Update password | \-0.25 |  |  | Change password with old password verification |
|  | Booking history and management |  |  |  |  |
|  | › View booking history | \-0.25 |  |  | List of past and upcoming bookings linked to user account |
|  | › View booking details | \-0.25 |  |  | Full booking details with trip info, seats, payment status |
|  | › Cancel booking | \-0.25 |  |  | Cancel booking with refund policy display |
|  | › Download e-ticket | \-0.25 |  |  | Download ticket as PDF |
|  | › Real-time trip updates | 0.5 |  |  | WebSocket-based live trip status updates (delays, cancellations) |
| **5** | **Administration features** |  |  |  |  |
|  | Update admin profile | \-0.25 |  |  | Admin profile management |
|  | Dashboard overview | \-0.5 |  |  | Dashboard with key metrics: total bookings, revenue, upcoming trips |
|  | Route Management |  |  |  |  |
|  | › Create, edit, deactivate routes | \-0.25 |  |  | Manage routes with origin, destination, stops, distance |
|  | › View route list | \-0.25 |  |  | List all routes with filters and pagination |
|  | Bus Management |  |  |  |  |
|  | › Create, edit, deactivate buses | \-0.25 |  |  | Manage buses with plate number, type, capacity |
|  | › Configure seat map | \-0.5 |  |  | Visual seat map configuration tool |
|  | › Upload bus photos | \-0.25 |  |  | Multi-image upload for buses |
|  | Trip Management |  |  |  |  |
|  | › View trip list | \-0.5 |  |  | List all trips with filters and pagination |
|  | › Filter trips by route, date, status | \-0.25 |  |  | Search and filter trips |
|  | › Sort trips by departure time, bookings | \-0.25 |  |  | Sortable trip list |
|  | › Create a new trip | \-0.25 |  |  | Add trip with route, bus, departure time, price |
|  | › Assign bus to trip | \-0.25 |  |  | Assign available bus to scheduled trip |
|  | › Set pickup/dropoff points | \-0.25 |  |  | Configure pickup and dropoff locations for trip |
|  | › Specify trip status | \-0.25 |  |  | Scheduled, In Progress, Completed, Cancelled |
|  | › Update a trip | \-0.25 |  |  | Edit existing trip details |
|  | › Cancel a trip | \-0.25 |  |  | Cancel trip with automatic refund processing |
|  | Booking Management |  |  |  |  |
|  | › View list of bookings | \-0.25 |  |  | Booking list sorted by creation time |
|  | › Filter bookings by status, date | \-0.25 |  |  | Filter: Pending, Confirmed, Cancelled, Completed |
|  | › View booking details | \-0.25 |  |  | Full booking details with passenger info, payment status |
|  | › Update booking status | \-0.25 |  |  | Confirm or cancel bookings |
|  | › Process refunds | \-0.25 | -0.25 |  | Handle refund requests |
|  | Reports |  |  |  |  |
|  | › View revenue report in time range | \-0.25 |  |  | Daily, weekly, monthly revenue reports |
|  | › View top routes by bookings | \-0.25 |  |  | Most popular routes report |
|  | › Show interactive chart in reports | \-0.25 |  |  | Chart.js/Recharts for analytics dashboard (bookings/day, revenue trends, popular routes) |
|  | User Management |  |  |  |  |
|  | › Create admin accounts | \-0.25 |  |  | Create new admin accounts |
|  | › Manage admin accounts | \-0.25 |  |  | View, edit, deactivate admin accounts |
|  | Trip Operations |  |  |  |  |
|  | › View passenger list | \-0.25 |  |  | List of passengers for each trip |
|  | › Check-in passengers | \-0.25 |  |  | Mark passengers as boarded |
|  | › Update trip status (operations) | \-0.25 |  |  | Mark trip as departed, arrived |
| **6** | **Advanced features** |  |  |  |  |
|  | Use memory cache to boost performance | 0.25 |  |  | Redis for trip caching and session management |
|  | Dockerize your project | 0.25 |  |  | Docker containers for backend, frontend, database |
|  | CI/CD | 0.25 |  |  | Automated testing and deployment pipeline (GitHub Actions, GitLab CI, Jenkins, etc.) |
|  | Microservices architecture | 0.5 |  |  | Separate services for auth, booking, payment, notifications |
|  | Saga pattern for transactions | 0.25 |  |  | Distributed transaction handling for booking flow |
|  | Test coverage >70% | 0.25 |  |  | Unit and integration tests with >70% coverage |

# **GIT HISTORY**

## **Contributors**

| Avatar | Username | Commits | Additions | Deletions |
| :---- | :---- | :---- | :---- | :---- |
|  | \<git_username_1\> |  |  |  |
|  | \<git_username_2\> |  |  |  |
|  | \<git_username_3\> |  |  |  |

## **Commits**

*List significant commits here with format:*

| Date | Author | Commit Message | Files Changed |
| :---- | :---- | :---- | :---- |
| YYYY-MM-DD | \<author\> | \<commit message\> | \<number\> |

---

# **PROJECT SUMMARY**

## System Overview
**Bus Ticket Booking System** is a web-based intercity bus ticketing platform for Vietnam that enables:
- Customers to search for bus trips with autocomplete and filtering
- Interactive seat selection with real-time availability updates
- Complete booking flow with passenger details and payment processing
- E-ticket generation and delivery via email
- Guest checkout without account registration
- AI chatbot support for trip search and booking assistance
- Admin dashboard for managing routes, buses, trips, and bookings
- Revenue and booking analytics reports

**Note:** This system targets a maximum score of 11.0/10.0 through MVP functionality and advanced microservices architecture.

## Technology Stack
- **Architecture:** Single Page Application (SPA) / Microservices (Advanced)
- **Frontend:** ReactJS / NextJS
- **Backend:** NodeJS with Express/NestJS
- **Database:** PostgreSQL
- **Authentication:** Passport.js with JWT
- **Payment:** Stripe, PayOS, VNPay, MoMo, or other payment gateways
- **Real-time:** Socket.IO / WebSocket
- **Caching:** Redis
- **AI:** OpenAI API for chatbot
- **Notifications:** SendGrid, AWS SES, Nodemailer, or other email services
- **Infrastructure:** Docker, GitHub Actions (CI/CD)
- **API Documentation:** Swagger/OpenAPI
- **Hosting:** AWS/GCP/Azure

## Key User Flows
1. **System Setup:** Admin login -> Route Creation -> Bus Setup -> Trip Scheduling
2. **Customer Registration:** Sign up -> Email Verification -> Login -> Access booking history
3. **Trip Booking:** Search Trip -> Select Trip -> Choose Seats -> Enter Details -> Payment -> Receive E-ticket
4. **Guest Booking:** Search Trip -> Select Trip -> Choose Seats -> Enter Details (no account) -> Payment -> Receive E-ticket
5. **Trip Management:** Admin Creates Trip -> Assigns Bus -> Configures Stops -> Trip Active -> Passengers Book -> Admin Checks-in Passengers -> Trip Departs -> Trip Completes

## Development Timeline
| Week | Focus | Key Deliverables |
| :---- | :---- | :---- |
| Week 1 | Infrastructure, auth, admin basics | Project setup, authentication, basic admin dashboard |
| Week 2 | Trip management, search functionality | Route/bus/trip CRUD, search with filters |
| Week 3 | Booking system, seat selection, ticketing | Seat map, booking flow, e-ticket generation |
| Week 4 | Payments, notifications, analytics | Payment gateway integration, email notifications, reports |
| Week 5 | AI chatbot, testing, deployment | OpenAI chatbot, >70% test coverage, production deployment |

---

*Note: Fill in the student information, contribution details, self-evaluation scores, and git history before submission.*