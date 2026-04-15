# Layered Architecture Refactor — movie-ticket-app-backend

## Context

The backend currently has **no clear separation of concerns**. Business logic lives inside route files (e.g., `bookingRoutes.js` is ~460 lines), two controllers are dead code, there are duplicate authorization middlewares, and three services that routes already import (`MovieService`, `RoomService`, `NotificationService`) don't exist yet — meaning those routes will crash on startup. The refactor moves all business logic into a proper layered architecture: **Routes → Controllers → Services → Models**.

---

## Architecture

```
Request → Route → Controller → Service → Model/DB
                  ↓
              apiResponse
```

- **Routes**: URL mapping + middleware only (auth, roles). No business logic.
- **Controllers**: Thin HTTP handlers — parse req, call service, format response via `apiResponse`.
- **Services**: All business logic, validation, DB ops, transactions, side effects.
- **Models**: Mongoose schemas only — no business logic.
- **Utils**: `apiResponse`, `logger`, `sendMail` — keep as-is.

---

## Final File Structure

```
movie-ticket-app-backend/
├── services/
│   ├── ShowtimeService.js           ✅ keep (already exists, singleton)
│   ├── BookingService.js            🆕 NEW — from bookingRoutes.js
│   ├── TicketService.js             🆕 NEW — PDF/QR/email from bookingRoutes.js
│   ├── UserService.js               🆕 NEW — from userRoutes.js
│   ├── AuthService.js               🆕 NEW — from auth.js (deduplicate)
│   ├── PaymentService.js            🆕 NEW — from paymentController.js
│   ├── MovieService.js              🆕 NEW — missing, needed by movieRoutes.js NOW
│   ├── NotificationService.js       🆕 NEW — missing, needed by notificationRoutes.js NOW
│   └── RoomService.js               🆕 NEW — missing, needed by roomRoutes.js NOW
│
├── controllers/
│   ├── BookingController.js         🆕 NEW
│   ├── UserController.js            🆕 NEW
│   ├── AuthController.js            🆕 NEW
│   ├── PaymentController.js         🔄 REPLACE existing
│   ├── ShowtimeController.js        🆕 NEW
│   ├── NotificationController.js    🔄 REPLACE existing (dead → live)
│   ├── movieController.js           ❌ DELETE (dead code)
│   └── notificationController.js    ❌ DELETE (dead code)
│
├── routes/
│   ├── auth.js                      🔄 REFACTOR (thin → AuthController)
│   ├── userRoutes.js                🔄 REFACTOR (thin → UserController)
│   ├── bookingRoutes.js             🔄 REFACTOR (thin → BookingController)
│   ├── showtimeRoutes.js            🔄 REFACTOR (thin → ShowtimeController)
│   ├── movieRoutes.js               ✅ keep (already thin, needs MovieService first)
│   ├── roomRoutes.js                ✅ keep (already thin, needs RoomService first)
│   ├── notificationRoutes.js        ✅ keep (already thin, needs NotificationService first)
│   └── paymentRoutes.js             ✅ keep (verify controller wiring)
│
├── middleware/
│   ├── auth.js                      ✅ keep (authMiddleware + authorizeRoles)
│   ├── authorize.js                 ❌ DELETE — duplicate of auth.js authorizeRoles
│   └── errorHandler.js              ✅ keep (registered LAST)
│
├── server.js                         🔄 MODIFY — remove bookingCleaner import,
│                                      call BookingService + NotificationService directly
├── bookingCleaner.js                ❌ DELETE — logic → BookingService.cleanExpiredBookings()
└── controllers/
    └── scheduleNotification.js        ❌ DELETE — logic → NotificationService.sendShowtimeReminders()
```

---

## Phases

### PHASE 0 — Unblock (do first, no route changes)

| Step | Action |
|------|--------|
| 0.1 | Create `services/MovieService.js` — currently missing, but `movieRoutes.js` already imports it |
| 0.2 | Create `services/RoomService.js` — currently missing, `roomRoutes.js` imports it |
| 0.3 | Create `services/NotificationService.js` — currently missing, `notificationRoutes.js` imports it |
| 0.4 | Delete `middleware/authorize.js` — full duplicate of `auth.js` `authorizeRoles` |
| 0.5 | Verify: `node server.js` starts without crash |

**These 3 services are minimal — just enough methods to make the existing routes work:**

```js
// services/MovieService.js — minimal stub to unblock movieRoutes.js
const Movie = require('../models/Movie');
const apiResponse = require('../utils/apiResponse');

const MovieService = {
  async create(data) { return Movie.create(data); },
  async getAll() { return Movie.find().lean(); },
  async getById(id) { return Movie.findById(id).lean(); },
  async update(id, data) { return Movie.findByIdAndUpdate(id, data, { new: true }); },
  async delete(id) { return Movie.findByIdAndDelete(id); },
};
module.exports = MovieService;

// services/RoomService.js — minimal stub to unblock roomRoutes.js
const Room = require('../models/Room');
const RoomService = {
  async create(data) { return Room.create(data); },
  async getAll() { return Room.find().lean(); },
  async getById(id) { return Room.findById(id); },
  async update(id, data) { return Room.findByIdAndUpdate(id, data, { new: true }); },
  async delete(id) { return Room.findByIdAndDelete(id); },
};
module.exports = RoomService;

// services/NotificationService.js — minimal stub to unblock notificationRoutes.js
const Notification = require('../models/Notification');
const NotificationService = {
  async getAll(userId) { return Notification.find({ userId }).sort({ createdAt: -1 }).lean(); },
  async getUnreadCount(userId) { return Notification.countDocuments({ userId, isRead: false }); },
  async markAsRead(id, userId) { return Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }); },
  async markAllAsRead(userId) { return Notification.updateMany({ userId, isRead: false }, { isRead: true }); },
};
module.exports = NotificationService;
```

---

### PHASE 1 — Core Business Logic Services

**Create in order (no dependencies between them):**

| Step | File | Source |
|------|------|--------|
| 1.1 | `services/BookingService.js` | Extract from `bookingRoutes.js` (~460 lines) |
| 1.2 | `services/TicketService.js` | Extract PDF/QR/email from `bookingRoutes.js` |
| 1.3 | `services/UserService.js` | Extract from `userRoutes.js` (~230 lines) |
| 1.4 | `services/AuthService.js` | Extract from `auth.js` + deduplicate with `userRoutes.js` |
| 1.5 | `services/PaymentService.js` | Extract from `paymentController.js` |

---

### PHASE 2 — Controllers (thin HTTP handlers)

**Create in any order (depend on Phase 1 services):**

| Step | File | Calls |
|------|------|-------|
| 2.1 | `controllers/BookingController.js` | BookingService + TicketService |
| 2.2 | `controllers/UserController.js` | UserService |
| 2.3 | `controllers/AuthController.js` | AuthService |
| 2.4 | `controllers/PaymentController.js` | PaymentService (replace existing) |
| 2.5 | `controllers/ShowtimeController.js` | ShowtimeService |
| 2.6 | `controllers/NotificationController.js` | NotificationService (replace dead file) |

**Controller pattern — every action:**

```js
exports.ACTION = async (req, res, next) => {
  try {
    const result = await Service.method({ ...req.params, ...req.body, userId: req.user.id });
    apiResponse(res).success(result, 'message');
  } catch (err) {
    next(err);
  }
};
```

---

### PHASE 3 — Route Refactoring

**Refactor in order:**

| Step | File | → Calls |
|------|------|---------|
| 3.1 | `routes/bookingRoutes.js` | BookingController |
| 3.2 | `routes/userRoutes.js` | UserController |
| 3.3 | `routes/auth.js` | AuthController |
| 3.4 | `routes/showtimeRoutes.js` | ShowtimeController (remove duplicate `generateSeats`) |
| 3.5 | `routes/paymentRoutes.js` | Verify PaymentController wired |

**Route pattern — middleware + controller only:**

```js
router.post('/hold', authMiddleware, authorizeRoles('customer'), BookingController.holdSeats);
```

---

### PHASE 4 — Cleanup

| Step | Action |
|------|--------|
| 4.1 | Delete `controllers/movieController.js` — dead code |
| 4.2 | Delete `controllers/notificationController.js` — dead code |
| 4.3 | Delete `controllers/scheduleNotification.js` — logic moved to NotificationService |
| 4.4 | Delete `bookingCleaner.js` — logic moved to BookingService.cleanExpiredBookings() |
| 4.5 | Update `server.js`: remove bookingCleaner import, call BookingService + NotificationService directly for cron jobs |

---

## Verification

### After Phase 0
```bash
node server.js
# No import errors → all routes load
```

### After Phase 3 — Smoke test (pick key flows)
```bash
# 1. Auth flow
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","name":"Test","email":"t@t.com"}'

# 2. Hold seats (use token from login)
curl -X POST http://localhost:5000/api/bookings/hold \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"showtimeId":"<id>","seats":["A1"]}'

# 3. Reserved seats (public)
curl http://localhost:5000/api/bookings/reserved-seats/<showtimeId>

# 4. Admin list bookings
curl http://localhost:5000/api/bookings/admin/bookings \
  -H "Authorization: Bearer <admin-token>"
```

### Regression checklist
- [ ] Hold seats → conflict still blocked, `expiresAt` = 5 min
- [ ] Pay → booking status `paid`, showtime seats `isBooked: true`, notification created
- [ ] Cancel (customer) → blocked within 1hr of showtime, seat freed if paid
- [ ] Cancel (admin) → any booking cancelled, notification sent, seat freed
- [ ] MoMo payment → returns payment URL from MoMo API
- [ ] Notification reminders → no double-send (dedup by `referenceId`)
- [ ] No duplicate login/register between `auth.js` and `userRoutes.js`
- [ ] `bookingCleaner.js` no longer runs as separate process

---

## Critical Design Decisions

1. **Services use plain objects** (not classes) — consistent with existing `ShowtimeService` singleton pattern
2. **Controllers use plain exports** (not classes) — standard Node.js HTTP pattern, no `this` binding issues
3. **MongoDB transaction** in `BookingService.confirmPayment` — atomic booking + showtime update
4. **Error convention**: services throw `new Error(msg)` with `err.statusCode = N`; controllers catch via `try/catch → next(err)`; global `errorHandler` maps to HTTP status
5. **Fire-and-forget notifications** — `Notification.create().catch(logger.error)` so failures don't break the main flow
