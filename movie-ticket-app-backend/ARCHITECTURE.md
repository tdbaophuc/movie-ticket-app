# Backend Architecture Documentation

> **DNC Cinemas — movie-ticket-app-backend**
> Last updated: April 2026

---

## 1. System Overview

### 1.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js v22 |
| Framework | Express.js v5 |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (access token: 15m, refresh token: 7d) |
| File Generation | PDFKit (ticket PDFs), QRCode (QR codes) |
| Email | Nodemailer (Gmail SMTP) |
| Scheduling | node-cron |
| Payments | MoMo e-Wallet API (HMAC-SHA256) |

### 1.2 Architecture Pattern

**Layered Architecture** — strict separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Routes Layer                      │
│         (URL mapping + middleware only)              │
├─────────────────────────────────────────────────────┤
│                  Controllers Layer                  │
│     (parse request → call service → format response) │
├─────────────────────────────────────────────────────┤
│                   Services Layer                     │
│   (all business logic, validation, DB operations)   │
├─────────────────────────────────────────────────────┤
│                    Models Layer                       │
│           (Mongoose schemas only)                    │
└─────────────────────────────────────────────────────┘
```

### 1.3 Directory Structure

```
movie-ticket-app-backend/
│
├── server.js                    # Entry point — Express app, cron jobs, DB connection
│
├── controllers/                 # Thin HTTP handlers (parse req, call service, format res)
│   ├── AuthController.js
│   ├── BookingController.js
│   ├── NotificationController.js
│   ├── PaymentController.js
│   ├── ShowtimeController.js
│   └── UserController.js
│
├── services/                   # Business logic (all DB operations, validation, side effects)
│   ├── AuthService.js          # JWT auth, login, register, logout, token refresh
│   ├── BookingService.js       # Hold seats, payment, cancellation, seat management
│   ├── NotificationService.js  # CRUD + 30-min showtime reminder cron
│   ├── PaymentService.js       # MoMo API integration
│   ├── ShowtimeService.js      # Showtime CRUD, seat generation, conflict detection
│   ├── TicketService.js        # PDF ticket generation, QR codes, email delivery
│   ├── UserService.js          # Profile, password change, status management
│   ├── MovieService.js         # Movie CRUD + search
│   └── RoomService.js          # Room CRUD
│
├── models/                     # Mongoose schemas (database schemas only)
│   ├── Booking.js
│   ├── Movie.js
│   ├── Notification.js
│   ├── Room.js
│   ├── Showtime.js
│   └── User.js
│
├── routes/                     # Route definitions (middleware + controller mapping)
│   ├── auth.js                  # /api/auth/*
│   ├── bookingRoutes.js         # /api/bookings/*
│   ├── movieRoutes.js           # /api/movies/*
│   ├── notificationRoutes.js    # /api/notifications/*
│   ├── paymentRoutes.js         # /api/payment/*
│   ├── roomRoutes.js            # /api/rooms/*
│   ├── showtimeRoutes.js        # /api/showtimes/*
│   └── userRoutes.js            # /api/user/*
│
├── middleware/                 # Express middleware
│   ├── auth.js                  # authMiddleware (JWT verify) + authorizeRoles (RBAC)
│   └── errorHandler.js          # Global error handler (registered LAST)
│
├── utils/                      # Shared utilities
│   ├── apiResponse.js           # Consistent JSON response wrapper
│   ├── logger.js                # Structured logging (JSON in prod, human-readable in dev)
│   └── sendMail.js              # Nodemailer email sender
│
├── fonts/                      # PDF fonts (Roboto-Regular.ttf)
├── assets/                     # Static assets (logo.png for ticket PDFs)
└── .env                        # Environment variables (NOT committed)
```

---

## 2. API Routes Summary

### 2.1 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register as `customer` |
| POST | `/login` | Public | Login → returns accessToken + refreshToken |
| POST | `/logout` | Public | Invalidate refreshToken |
| POST | `/refresh-token` | Public | Exchange refreshToken → new accessToken |

### 2.2 Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/hold` | customer | Hold seats (5-min pending expiry) |
| POST | `/pay/:bookingId` | customer | Confirm payment (atomic: booking + seats lock) |
| GET | `/my` | customer | List own bookings with QR codes |
| DELETE | `/:bookingId` | customer | Cancel (blocked ≤1hr before showtime) |
| GET | `/reserved-seats/:showtimeId` | public | List reserved seats for a showtime |
| GET | `/successful/:bookingId` | customer | Email ticket PDF |
| GET | `/admin/bookings` | admin | List all bookings |
| PUT | `/admin/bookings/:bookingId` | admin | Update booking seats |
| DELETE | `/admin/bookings/:bookingId` | admin | Admin cancel (no time restriction) |

### 2.3 Movies — `/api/movies`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | public | List all movies |
| GET | `/search?q=` | public | Search by title or genre |
| POST | `/` | admin | Create movie |
| PUT | `/:id` | admin | Update movie |
| DELETE | `/:id` | admin | Delete movie |

### 2.4 Showtimes — `/api/showtimes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | public | List all showtimes |
| GET | `/:id` | public | Get showtime by ID |
| GET | `/movie/:movieId` | public | List showtimes for a movie |
| POST | `/` | admin | Create showtime (auto-generates seats, checks room conflict) |
| PUT | `/:id` | admin | Update showtime |
| DELETE | `/:id` | admin | Delete showtime |

### 2.5 Rooms — `/api/rooms`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | admin | List all rooms |
| POST | `/` | admin | Create room |
| PUT | `/:id` | admin | Update room |
| DELETE | `/:id` | admin | Delete room |

### 2.6 Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | customer | List own notifications + unread count |
| POST | `/` | customer | Create notification |
| PUT | `/:id/read` | customer | Mark as read |
| PUT | `/read-all` | customer | Mark all as read |

### 2.7 Payments — `/api/payment`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/momo` | customer | Create MoMo payment URL |

### 2.8 Users — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me` | customer | Get own profile |
| PUT | `/:userId` | customer/admin | Update profile or status |
| PUT | `/change-password/:userId` | customer/admin | Change password |
| GET | `/admin/users` | admin | List all users |

---

## 3. Service Layer

### 3.1 Service Pattern

All services are **plain objects** (singleton pattern), exported directly. They contain all business logic, validation, and database operations.

```javascript
// Pattern: no class, no `this`, just async methods
const MyService = {
  async doSomething({ param1, param2 }) {
    // validation → DB ops → side effects → return
  },
};
module.exports = MyService;
```

### 3.2 AuthService

Handles all authentication logic.

| Method | Description |
|--------|-------------|
| `register({ username, password, name, email })` | Create customer account. Role hardcoded to `customer` — never from req.body. |
| `login({ username, password })` | Verify credentials, issue accessToken (15m) + refreshToken (7d). Rejects banned users. |
| `logout(refreshToken)` | Clear refreshToken from DB. Idempotent. |
| `refreshToken(refreshToken)` | Verify refreshToken, issue new accessToken. |

**Error codes:** 400 (bad credentials), 403 (banned), 404 (user not found).

### 3.3 BookingService

Core booking lifecycle — all seat and payment logic lives here.

| Method | Description |
|--------|-------------|
| `holdSeats({ userId, showtimeId, seats })` | Create pending booking. Conflict-check prevents double-booking. `expiresAt` = now + 5 min. |
| `confirmPayment({ bookingId, userId })` | **Uses MongoDB transaction** — atomically locks seats on Showtime and sets booking to `paid`. Sends fire-and-forget notification. |
| `cancelByCustomer({ bookingId, userId })` | Cancel own booking. Blocked ≤1hr before showtime. Frees seats if `paid`. Deletes booking. |
| `cancelByAdmin({ bookingId })` | Cancel any booking. No time restriction. Frees seats, sets status `cancelled`. |
| `updateSeats({ bookingId, seats })` | Admin updates booking seats. Conflict-checks new seats. |
| `getUserBookings({ userId })` | List user's bookings with populated showtime/movie/room. |
| `getAllBookings()` | Admin list all bookings with full population. |
| `getReservedSeats({ showtimeId })` | Flat list of all reserved (non-cancelled) seats for a showtime. |
| `cleanExpiredBookings()` | Called by server.js every 60s. Bulk-cancels expired pending bookings. |

### 3.4 TicketService

PDF ticket generation and email delivery.

| Method | Description |
|--------|-------------|
| `generateQrCode(bookingId)` | Returns QR code as a data URL. Content: `Mã vé: <id>`. |
| `enrichWithQrCode(bookings)` | Maps over bookings array, adds `qrCode` field to paid bookings. |
| `generateTicketPdf(booking)` | Builds landscape A4 PDF with: logo, movie title, showtime, room, seats, booking ID, customer name, QR code. |
| `emailTicket({ bookingId, userId })` | Validates ownership + paid status, generates PDF, sends via Gmail SMTP. |

### 3.5 ShowtimeService

| Method | Description |
|--------|-------------|
| `generateSeats(rows=10, cols=15)` | Generates A1..J15 seat layout. Called automatically on showtime creation. |
| `create(data)` | Validates room exists, checks time conflict in same room, auto-generates seats. |
| `getAll()` | List all with `movie` + `room` populated. |
| `getAvailableSeats(showtimeId)` | Returns `{ total, booked, available }` seat counts. |
| `getByMovie(movieId)` | List showtimes for a specific movie. |
| `getById(id)`, `update(id, data)`, `delete(id)` | CRUD operations. |

### 3.6 UserService

| Method | Description |
|--------|-------------|
| `register({ name, email, username, password })` | Create account. Checks email/username uniqueness. |
| `getProfile(userId)` | Returns user profile, stripped of `password` + `refreshToken`. |
| `updateUser({ userId, updateData, actorId, actorRole })` | Updates fields. On `banned` → sends email + notification. On `active` from `banned` → sends unlock email + notification. Non-admin can only update self. |
| `changePassword({ targetUserId, actorId, actorRole, oldPassword, newPassword })` | Only verifies old password if actor === target. New password hashed by User model's `pre('save')` hook. |
| `getAllUsers()` | Admin list all users without sensitive fields. |

### 3.7 NotificationService

| Method | Description |
|--------|-------------|
| `getAll(userId)` | All notifications for user, newest first. |
| `getUnreadCount(userId)` | Count of unread notifications. |
| `create(userId, data)` | Create a notification. |
| `markAsRead(id, userId)` | Mark single notification as read. |
| `markAllAsRead(userId)` | Bulk mark all as read. |
| `sendShowtimeReminders()` | **Called every minute by cron.** Finds paid bookings with showtime in next 30 min, sends reminder notification. Deduplicates by `referenceId`. |

### 3.8 PaymentService

| Method | Description |
|--------|-------------|
| `createMoMoPayment({ totalAmount, bookingId, redirectUrl })` | Builds HMAC-SHA256 signature, POSTs to MoMo API. Returns MoMo response containing `payUrl`. |

---

## 4. Controller Layer

Controllers are **thin HTTP handlers** — they only:
1. Extract request data (`req.params`, `req.body`, `req.user.id`)
2. Call the appropriate service method
3. Format the response via `apiResponse()`
4. Catch errors and pass to `next(err)`

```javascript
// Example controller
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getUserBookings({ userId: req.user.id });
    const enriched = await TicketService.enrichWithQrCode(bookings);
    apiResponse(res).success({ bookings: enriched });
  } catch (err) {
    next(err);
  }
};
```

**No business logic lives in controllers.**

---

## 5. Model Layer

Models are **Mongoose schemas only** — no business logic, no static methods with business rules.

### 5.1 Booking
```
user          Ref → User          (indexed)
showtime      Ref → Showtime      (indexed, compound: showtime+status)
seats         String[]
status        enum: pending | paid | cancelled  (indexed, compound: status+expiresAt)
expiresAt     Date    (5-min hold expiry)
createdAt     Date    (set on payment confirmation)
```

### 5.2 Showtime
```
movie         Ref → Movie
dateTime      Date    (indexed, compound: room+dateTime)
endDateTime   Date    (movie.duration added to dateTime)
room          Ref → Room (indexed)
seats         [{ seatNumber, isBooked }]  (embedded, 150 seats by default)
ticketPrice   Number
format        enum: 2D | 3D | IMAX
language      enum: Phụ đề | Lồng tiếng
```

### 5.3 User
```
name, email, username, password  (password hashed by pre('save') hook)
role         enum: admin | customer
status       enum: active | inactive | banned
refreshToken String
comparePassword(password) — instance method using bcrypt
```

### 5.4 Notification
```
userId        Ref → User  (indexed, compound: userId+isRead+createdAt)
title, message, icon, type
isRead        Boolean (indexed)
referenceId   Ref → Booking  (used for dedup in reminder notifications)
```

---

## 6. Middleware

### 6.1 authMiddleware

Extracts and verifies JWT from `Authorization: Bearer <token>` header.

```
req.user = { id, role }  ← attached after verification
401 — missing or invalid token
```

### 6.2 authorizeRoles(...roles)

Factory returning middleware that checks `req.user.role`.

```javascript
router.post('/hold', authMiddleware, authorizeRoles('customer'), handler);
// Also supports: authorizeRoles('admin'), authorizeRoles('customer', 'admin')
403 — role not permitted
```

### 6.3 errorHandler (registered LAST)

Global 4-argument Express error handler. Catches all errors from all routes.

| Error Type | HTTP Status |
|-----------|-------------|
| Mongoose ValidationError | 400 |
| Mongoose CastError (bad ObjectId) | 400 |
| MongoDB duplicate key (code 11000) | 409 |
| JsonWebTokenError | 401 |
| TokenExpiredError | 401 |
| `err.statusCode` set manually | err.statusCode |
| Default | 500 |

Stack trace included in non-production only.

---

## 7. Scheduled Jobs

### 7.1 Reminder Notifications — every minute

```javascript
cron.schedule('* * * * *', () => {
  NotificationService.sendShowtimeReminders().catch(...);
});
```

Finds all `paid` bookings where `showtime.dateTime` is within 30 minutes. Sends one notification per booking. Deduplicates by `referenceId` (booking._id).

### 7.2 Expired Booking Cleanup — every 60 seconds

```javascript
setInterval(async () => {
  const count = await BookingService.cleanExpiredBookings();
}, 60 * 1000);
```

Bulk-cancels all bookings where `status = 'pending'` AND `expiresAt < now()`. Logs count of cancelled bookings.

---

## 8. Response Format

All API responses use a consistent JSON structure via `apiResponse()`:

```javascript
// Success
{ "success": true, "data": {...}, "message": "..." }

// Created
{ "success": true, "data": {...}, "message": "..." }

// Error
{ "success": false, "error": "..." }
// With optional details:
{ "success": false, "error": "...", "details": [...] }
```

HTTP status codes convey the category; `success: false` signals errors in the body.

---

## 9. Authentication & Authorization

### 9.1 JWT Structure

**Access Token** (expires: 15 minutes):
```json
{ "id": "<userId>", "role": "customer | admin" }
```

**Refresh Token** (expires: 7 days):
```json
{ "id": "<userId>", "role": "customer | admin" }
```

Refresh token is stored in `User.refreshToken` in the database.

### 9.2 Role-Based Access Control

| Role | Access |
|------|--------|
| `customer` | Own bookings, own profile, hold/pay/cancel tickets, notifications, MoMo payment |
| `admin` | All customer access + movies, rooms, showtimes CRUD + all bookings + all users |

---

## 10. Error Handling Conventions

```
Route → calls → Controller (try/catch → next(err))
                  ↓
             Service (throws errors with err.statusCode = N)
                  ↓
             Model / Utils (Mongoose errors bubble up)

Global errorHandler → maps error type → HTTP status → JSON response
```

**Service error pattern:**
```javascript
if (!entity) {
  const err = new Error('Entity not found');
  err.statusCode = 404;
  throw err;
}
```

**Fire-and-forget pattern** (for non-critical side effects like notifications):
```javascript
Notification.create({ ... }).catch((e) =>
  logger.error('ServiceName', 'Notification failed', { error: e.message })
);
```

---

## 11. Key Design Decisions

| Decision | Rationale |
|---------|-----------|
| Plain objects for services (not classes) | Consistent with existing `ShowtimeService` singleton pattern. No `this` binding complexity. |
| Controllers use plain exports (not classes) | Standard Node.js HTTP pattern. Easier to trace in stack traces. |
| MongoDB transaction on `confirmPayment` | Atomically updates `Booking.status` + `Showtime.seats[].isBooked` — prevents data inconsistency if one write fails. |
| `expiresAt` on Booking instead of hard delete | Allows the booking record to remain (with status `cancelled`) for audit/history. |
| Seats generated at showtime creation, stored in Showtime | Avoids regenerating 150 seats per showtime. `isBooked` flag is source of truth, reconciled with Booking records in `getAvailableSeats`. |
| `bookingCleaner` as in-process interval, not separate process | Single deployment unit. Cleaner crashes don't leave orphaned processes. |
| `NotificationService` handles reminders, not a separate script | Reminders are a business concern (service), not infrastructure. Consistent with the layered pattern. |

---

## 12. Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development | production

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=<random-256-bit>
JWT_REFRESH_SECRET=<random-256-bit>

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password

# MoMo Payment
MOMO_ENDPOINT=https://test-payment.momo.vn/...
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_STORE_ID=...
MOMO_IPN_URL=...

# Logging
LOG_LEVEL=debug | info | warn | error
```

---

## 13. Getting Started

### 13.1 Install Dependencies
```bash
cd movie-ticket-app-backend
npm install
```

### 13.2 Configure Environment
```bash
cp .env.example .env
# Fill in all required variables
```

### 13.3 Start Development Server
```bash
npm run dev  # or: node server.js
```

### 13.4 Verify All Routes Load
```bash
curl http://localhost:5000/api/movies
# Expected: { "success": true, "data": { "movies": [...] } }
```

---

## 14. Testing Checklist

| Area | Test |
|------|------|
| **Auth** | Register → login → get token → use token to access protected endpoint → logout |
| **Booking hold** | Hold seats → second hold for same seats returns conflict error |
| **Booking pay** | Pay expired booking → 400 error |
| **Booking cancel (customer)** | Cancel >1hr before showtime → success; cancel ≤1hr → blocked |
| **Booking cancel (admin)** | Admin cancels any booking regardless of time |
| **Reserved seats** | Hold seats → reserved-seats shows them; cancel → removed |
| **Notifications** | Create → mark as read → mark all as read |
| **Admin routes** | Customer calling admin endpoint → 403 |
| **Auth invalid** | Request without token → 401; invalid token → 401; expired token → 401 |

---

*End of architecture documentation.*
