# Seat Lock API Documentation

## Overview

The **Seat Lock API** is a secure endpoint that handles seat locking for the booking flow. It prevents double-booking by temporarily locking selected seats and returning a JWT token (`lock_token`) for subsequent booking operations.

## Endpoint

```
POST /seat-status/lock
```

## Request

### URL

```
POST /api/seat-status/lock
```

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "trip_id": "550e8400-e29b-41d4-a716-446655440000",
  "seat_ids": ["seat-001", "seat-002", "seat-003"]
}
```

#### Fields

| Field      | Type     | Required | Notes                                         |
| ---------- | -------- | -------- | --------------------------------------------- |
| `trip_id`  | UUID     | ✅       | Must be a valid trip ID in `scheduled` status |
| `seat_ids` | string[] | ✅       | Array of seat IDs to lock. Min 1 seat         |

## Response

### Success (200 OK)

```json
{
  "success": true,
  "trip_id": "550e8400-e29b-41d4-a716-446655440000",
  "seat_ids": ["seat-001", "seat-002"],
  "locked_until": "2025-02-20T09:30:00.000Z",
  "lock_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmlwSWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJzZWF0SWRzIjpbInNlYXQtMDAxIiwic2VhdC0wMDIiXSwibG9ja2VkVW50aWwiOjE3MzczODI2MDAwMDAsImlhdCI6MTczNzM4MjIwMCwiZXhwIjoxNzM3MzgyNjAwfQ.signature"
}
```

#### Response Fields

| Field          | Type     | Description                       |
| -------------- | -------- | --------------------------------- |
| `success`      | boolean  | Always `true` on success          |
| `trip_id`      | UUID     | The trip ID from request          |
| `seat_ids`     | string[] | Array of locked seat IDs          |
| `locked_until` | ISO 8601 | Timestamp when lock expires (UTC) |
| `lock_token`   | string   | JWT token for booking operations  |

### Error Responses

#### 404 Not Found - Trip Not Found

```json
{
  "success": false,
  "error": "TRIP_NOT_FOUND",
  "message": "Trip not found"
}
```

#### 409 Conflict - Trip Unavailable

```json
{
  "success": false,
  "error": "TRIP_UNAVAILABLE",
  "message": "Trip is cancelled or no longer available."
}
```

Possible messages:

- "Trip is cancelled or no longer available."
- "Trip departure time has passed."
- "Operator is not active."
- "Bus is not active."

#### 409 Conflict - Seat Locked by Another User

```json
{
  "success": false,
  "error": "SEAT_LOCKED",
  "message": "Seat is locked by another user",
  "seat": "seat-001",
  "locked_until": "2025-02-20T09:25:00.000Z"
}
```

**Note:** Frontend should show the countdown until `locked_until` and suggest trying again.

#### 409 Conflict - Seat Already Booked

```json
{
  "success": false,
  "error": "SEAT_BOOKED",
  "message": "Seats already booked: seat-001"
}
```

#### 400 Bad Request - Seat Not Found

```json
{
  "success": false,
  "error": "SEAT_NOT_FOUND",
  "message": "Seat status not found for seats: seat-999"
}
```

## Backend Validation Rules

### 1. Trip Validation

- ✅ Trip must exist in database
- ✅ Trip status must be `scheduled`
- ✅ Trip departure time must be in the future
- ✅ Bus must be active (`isActive = true`)
- ✅ Operator must be active (`isActive = true`)

### 2. Seat Validation

For each seat in `seat_ids`:

- ✅ Seat must exist in the database
- ✅ Seat must belong to the trip's bus
- ✅ Seat status record must exist for this trip

### 3. Seat Availability Validation

Using **pessimistic locking** (FOR UPDATE) to prevent race conditions:

| Current State | Lock Expired?           | Action                   |
| ------------- | ----------------------- | ------------------------ |
| `available`   | N/A                     | ✅ Can lock              |
| `locked`      | Yes (lockedUntil < now) | ✅ Can lock (reset lock) |
| `locked`      | No (lockedUntil > now)  | ❌ FAIL - SEAT_LOCKED    |
| `booked`      | N/A                     | ❌ FAIL - SEAT_BOOKED    |

### 4. Atomicity & Race Condition Prevention

```sql
-- Inside transaction with REPEATABLE_READ isolation
BEGIN TRANSACTION
  SELECT * FROM seat_statuses
  WHERE trip_id = $1 AND seat_id IN (...)
  FOR UPDATE  -- Pessimistic lock

  -- Validate all seats
  -- If any fails, ROLLBACK and throw error
  -- If all pass, UPDATE all seats to locked state

  UPDATE seat_statuses
  SET state = 'locked', locked_until = $2
  WHERE trip_id = $1 AND seat_id IN (...)
COMMIT
```

**Key Point:** If ANY seat validation fails, NO seats are locked (atomic all-or-nothing).

## Lock Token (JWT)

### Payload Structure

```json
{
  "trip_id": "550e8400-e29b-41d4-a716-446655440000",
  "seat_ids": ["seat-001", "seat-002"],
  "locked_until": 1737382600000,
  "iat": 1737382200,
  "exp": 1737382600
}
```

### Token Properties

| Field          | Type     | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `trip_id`      | UUID     | ID of the locked trip                      |
| `seat_ids`     | string[] | Array of locked seat IDs                   |
| `locked_until` | number   | Timestamp (milliseconds) when lock expires |
| `iat`          | number   | JWT issued at (Unix timestamp in seconds)  |
| `exp`          | number   | JWT expiration (Unix timestamp in seconds) |

### Token Verification

The `lock_token` should be:

1. **Verified** before proceeding to booking step
2. **Included** in subsequent booking API calls
3. **Validated** server-side to ensure:
   - Token is not expired (`exp < now()`)
   - Trip ID matches
   - Seat IDs match the user's selection

### Token Security

- ✅ Signed with `JWT_SECRET` from environment
- ✅ Expiration matches `locked_until` time
- ✅ Cannot be forged without secret key
- ✅ Cannot be modified without invalidating signature

## Lock Duration Configuration

### Default Lock Duration

**10 minutes (600 seconds)**

### How to Configure

Set environment variable in `.env`:

```bash
SEAT_LOCK_DURATION=600  # seconds
```

### Examples

```bash
SEAT_LOCK_DURATION=300   # 5 minutes
SEAT_LOCK_DURATION=600   # 10 minutes (default)
SEAT_LOCK_DURATION=1200  # 20 minutes
```

## Lock Expiration & Automatic Unlock

### Expiration

Locks are configured to expire after `SEAT_LOCK_DURATION` seconds.

### Automatic Cleanup (Cron Job)

A scheduled task runs every 1 minute:

```sql
UPDATE seat_statuses
SET state = 'available', locked_until = NULL
WHERE state = 'locked' AND locked_until < NOW()
```

This ensures expired locks are automatically cleared, freeing seats for other customers.

### Frontend Countdown

Display countdown on UI:

```javascript
const expiresIn = new Date(response.locked_until) - new Date();
// Update countdown every second
setInterval(() => {
  expiresIn -= 1000;
  // Warn user if < 2 minutes remaining
}, 1000);
```

## Error Handling Flow

### Frontend Error Handling Strategy

```typescript
try {
  const response = await lockSeats(tripId, seatIds);

  if (!response.success) {
    switch (response.error) {
      case 'TRIP_NOT_FOUND':
        // Show: "This trip is no longer available"
        // Action: Redirect to search
        break;

      case 'TRIP_UNAVAILABLE':
        // Show: response.message
        // Action: Redirect to search
        break;

      case 'SEAT_LOCKED':
        // Show: "Seat ${response.seat} is locked until ${response.locked_until}"
        // Action: Suggest retry or select different seats
        break;

      case 'SEAT_BOOKED':
        // Show: "Seat ${response.seat} is already booked"
        // Action: Deselect seat, show unavailable
        break;

      case 'SEAT_NOT_FOUND':
        // Show: "Some seats are invalid"
        // Action: Reload seat map
        break;
    }
  } else {
    // Success: Proceed to booking
    // Store lock_token for next steps
    sessionStorage.setItem('lockToken', response.lock_token);
  }
} catch (error) {
  // Handle network error
}
```

## Integration with Booking Flow

### Step 1: Seat Selection (Current)

- User selects seats on UI
- Seats are highlighted locally

### Step 2: Lock Seats (POST /seat-status/lock)

- User clicks "Proceed to Booking"
- Call this endpoint with selected seat IDs
- Receive `lock_token` on success

### Step 3: Validate Booking (Future API)

- Call booking validation endpoint
- Include `lock_token` in request
- Endpoint verifies token and seat selection

### Step 4: Create Booking (Future API)

- Call create booking endpoint
- Include `lock_token` in request
- Backend creates booking with verified lock

### Step 5: Payment (Future API)

- User completes payment
- Lock is converted to booking (state = 'booked', booking_id set)

### Step 6: Booking Cancellation (Future API)

- If user cancels, unlock seats
- Call unlock endpoint with `lock_token`
- Seats return to 'available' state

## Example cURL Request

```bash
curl -X POST http://localhost:3000/api/seat-status/lock \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": "550e8400-e29b-41d4-a716-446655440000",
    "seat_ids": ["seat-001", "seat-002", "seat-003"]
  }'
```

## Example Response

### Success

```json
{
  "success": true,
  "trip_id": "550e8400-e29b-41d4-a716-446655440000",
  "seat_ids": ["seat-001", "seat-002", "seat-003"],
  "locked_until": "2025-02-20T09:30:00.000Z",
  "lock_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error - Seat Locked

```json
{
  "success": false,
  "error": "SEAT_LOCKED",
  "message": "Seat is locked by another user",
  "seat": "seat-001",
  "locked_until": "2025-02-20T09:25:00.000Z"
}
```

## Security Considerations

### 1. Input Validation

- ✅ Trip ID must be valid UUID
- ✅ Seat IDs must be non-empty strings
- ✅ At least 1 seat required

### 2. Race Condition Prevention

- ✅ Pessimistic locking (FOR UPDATE)
- ✅ Transaction isolation (REPEATABLE_READ)
- ✅ Atomic all-or-nothing locking

### 3. Token Security

- ✅ JWT signed with server secret
- ✅ Token expiration enforced
- ✅ Cannot be forged or modified
- ✅ Includes data integrity (tripId, seatIds)

### 4. Time-Based Security

- ✅ Trip must be in future
- ✅ Lock duration is configurable
- ✅ Automatic cleanup of expired locks

## Performance Considerations

### Query Performance

- ✅ Indexed queries: `tripId`, `seatId`
- ✅ Single round trip to DB with FOR UPDATE
- ✅ Minimal data transfer

### Lock Contention

- ✅ Pessimistic locks held briefly
- ✅ Transaction completes quickly
- ✅ Row-level locking only (not table-level)

### Scalability

- ✅ Can handle concurrent requests
- ✅ Database connection pooling recommended
- ✅ Cron job for cleanup (doesn't block requests)

## Testing

### Test Cases

#### 1. Happy Path - Lock Multiple Seats

```javascript
POST /seat-status/lock
{
  "trip_id": "valid-uuid",
  "seat_ids": ["seat-001", "seat-002"]
}
// Expected: 200 OK with lock_token
```

#### 2. Trip Not Found

```javascript
POST /seat-status/lock
{
  "trip_id": "invalid-uuid",
  "seat_ids": ["seat-001"]
}
// Expected: 404 TRIP_NOT_FOUND
```

#### 3. Seat Already Locked

```javascript
// First request
POST /seat-status/lock { trip_id: "A", seat_ids: ["seat-001"] }
// Expected: 200 OK

// Second request (same seat, different user)
POST /seat-status/lock { trip_id: "A", seat_ids: ["seat-001"] }
// Expected: 409 SEAT_LOCKED with locked_until
```

#### 4. Partial Failure (One Seat Invalid)

```javascript
POST /seat-status/lock
{
  "trip_id": "valid-uuid",
  "seat_ids": ["seat-001", "seat-invalid"]
}
// Expected: 400 SEAT_NOT_FOUND
// Result: seat-001 NOT locked (atomic)
```

#### 5. Lock Expiration

```javascript
// Lock seat
POST /seat-status/lock { trip_id: "A", seat_ids: ["seat-001"] }
// locked_until: T+600s

// Wait 600+ seconds

// Try to lock again
POST /seat-status/lock { trip_id: "A", seat_ids: ["seat-001"] }
// Expected: 200 OK (expired lock was cleared)
```

## Troubleshooting

### Issue: Always getting SEAT_LOCKED

**Cause:** Lock duration is too long or cron job not running

**Solution:**

1. Check `SEAT_LOCK_DURATION` env variable
2. Verify cron job is running
3. Manually clear expired locks:
   ```sql
   UPDATE seat_statuses
   SET state = 'available', locked_until = NULL
   WHERE state = 'locked' AND locked_until < NOW()
   ```

### Issue: Seats marked locked but no user claims them

**Cause:** User session ended/cancelled without unlocking

**Solution:**

- Automatic cron job cleanup will handle this
- Manual cleanup available (see above)

### Issue: JWT token verification failing

**Cause:** Different `JWT_SECRET` between requests or token modified

**Solution:**

1. Ensure same `JWT_SECRET` in all environments
2. Don't pass token through untrusted clients
3. Verify token immediately after receiving it

---

## API Compatibility

- **Swagger UI:** `/api/docs` - Interactive API documentation
- **OpenAPI Version:** 3.0.0
- **NestJS Version:** 10+
- **TypeORM Version:** 0.3+

## Related APIs

- `POST /bookings` - Create booking (uses lock_token)
- `POST /bookings/:id/cancel` - Cancel booking (unlocks seats)
- `GET /trips/:id/seats` - Get seat map with status
