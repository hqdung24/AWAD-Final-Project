# 📢 Notification Emit Audit Report

## Tóm tắt

✅ **Đầy đủ 5/5 loại notification** có emit event  
❌ **Thiếu 2 chỗ quan trọng** cần thêm realtime broadcast cho socket.io

---

## 📋 Defined Notification Types

Backend định nghĩa **5 loại notification**:

```typescript
// backend/src/modules/notification/enums/notification.enum.ts
export enum NotificationType {
  TRIP_REMINDER_24H = 'trip_reminder_24h', // Nhắc nhở 24h trước
  TRIP_REMINDER_3H = 'trip_reminder_3h', // Nhắc nhở 3h trước
  TRIP_LIVE_UPDATE = 'trip_live_update', // Cập nhật trạng thái chuyến
  BOOKING_CONFIRMATION = 'booking_confirmation', // Xác nhận thanh toán
  BOOKING_INCOMPLETE = 'booking_incomplete', // Booking chưa hoàn thành (hết hạn)
}
```

---

## ✅ Chỗ đang emit `notification.create`

### 1️⃣ **BOOKING_INCOMPLETE** - ✅ Emit 2 chỗ

#### 📍 Chỗ 1: Khi user tạo booking (chưa thanh toán)

- **File**: `backend/src/modules/booking/booking.service.ts` (line 93)
- **Method**: `createBooking()`
- **Điều kiện**: `userId !== undefined`
- **Payload**:
  ```typescript
  {
    userId,
    type: BOOKING_INCOMPLETE,
    payload: {
      bookingId, tripId, bookingRef, resumeUrl, bookingStatus, expiresAt
    }
  }
  ```
- **Mục đích**: Thông báo booking được tạo, chờ thanh toán (12h timeout)

#### 📍 Chỗ 2: Khi user hủy/chỉnh sửa booking

- **File**: `backend/src/modules/booking/booking.service.ts` (line 166)
- **Method**: `updateBooking()` (khi user hủy)
- **Điều kiện**: `userId !== undefined && booking.status = 'cancelled'`
- **Payload**: Similar to above

#### 📍 Chỗ 3: Cron job expire pending bookings

- **File**: `backend/src/modules/booking/booking.service.ts` (line 286)
- **Method**: `expirePendingBooking()`
- **Trigger**: `@Cron('0 */5 * * * *')` (every 5 min via schedule.service.ts)
- **Điều kiện**: `booking.status === 'pending' && createdAt < 12h ago`
- **Payload**:
  ```typescript
  {
    userId,
    type: BOOKING_INCOMPLETE,
    payload: {
      bookingId, tripId, bookingRef, resumeUrl, bookingStatus: 'expired'
    }
  }
  ```
- **Mục đích**: Thông báo booking hết hạn, cần book lại

---

### 2️⃣ **BOOKING_CONFIRMATION** - ✅ Emit 1 chỗ

#### 📍 Chỗ duy nhất: Payment webhook success

- **File**: `backend/src/modules/payment/providers/payment.service.ts` (line 282)
- **Method**: `handlePaymentWebhook()`
- **Trigger**: Khi PayOS webhook callback với `code === '00'` (paid)
- **Điều kiện**: `bookingDetail.userId !== undefined`
- **Payload**:
  ```typescript
  {
    userId: bookingDetail.userId,
    type: BOOKING_CONFIRMATION,
    payload: {
      bookingId, tripId, bookingRef, totalAmount, currency: 'VND',
      seats: [...], departureTime
    }
  }
  ```
- **Mục đích**: Xác nhận thanh toán thành công, gửi email + in-app notification

---

### 3️⃣ **TRIP_LIVE_UPDATE** - ✅ Emit 1 chỗ

#### 📍 Chỗ duy nhất: Trip status updated

- **File**: `backend/src/modules/trip/trip.service.ts` (line 174)
- **Method**: `updateTrip()`
- **Trigger**: Khi admin update trip status (scheduled → cancelled/completed)
- **Điều kiện**:
  - `statusChanged === true`
  - `booking.userId !== undefined`
  - `booking.status !== 'cancelled' && booking.status !== 'expired'`
- **Payload**:
  ```typescript
  {
    userId: booking.userId,
    type: TRIP_LIVE_UPDATE,
    payload: {
      tripId, bookingId, bookingRef,
      message: `Trip status for booking ${bookingRef} updated to ${newStatus}`
    }
  }
  ```
- **Mục đích**: Thông báo user về thay đổi trạng thái chuyến đi

---

### 4️⃣ **TRIP_REMINDER_24H** & **TRIP_REMINDER_3H** - ✅ Emit via Scheduler

#### 📍 Cron job send trip reminders

- **File**: `backend/src/modules/schedule/schedule.service.ts` (line 72)
- **Method**: `sendTripReminders()`
- **Trigger**: `@Cron('0 */5 * * * *')` (every 5 min - comment says "every 1 minute")
- **Logic**:
  1. Find bookings departing in 24h window ± 15min buffer
  2. Find bookings departing in 3h window ± 10min buffer
  3. Check user notification preference
  4. Emit via `notificationService.processReminderWindow()`

#### 📍 Actual emit happens in:

- **File**: `backend/src/modules/notification/notification.service.ts`
- **Method**: `processReminderWindow()`
- **Payload**: Dynamically built from `NotificationReminderPayloadProvider`
- **Channels**: EMAIL + IN_APP

---

## ❌ Thiếu: Realtime Socket.io Broadcast

### Vấn đề

Hiện tại khi emit `notification.create`, event được:

1. ✅ Save vào database
2. ✅ Gửi email
3. ✅ Emit tới WebSocket listeners (via `RealtimeNotificationListener`)
4. ❌ **THIẾU**: Không có broadcast realtime cho users khác khi:
   - Trip status changed
   - Seat locked/released

### Chi tiết thiếu

#### 🔴 **Problem 1**: Trip status change không broadcast tới viewers

- Khi admin update trip → chỉ emit `TRIP_LIVE_UPDATE` cho passengers
- Nhưng không có broadcast cho:
  - Users browsing trip list (seat availability changed)
  - Users on trip detail page
  - **Solution needed**: Thêm event `trip.updated` → broadcast tới all users

#### 🔴 **Problem 2**: Seat lock không có realtime sync từ admin side

- Cron job release expired locks mỗi 5 phút
- Nhưng không emit realtime event → users vẫn thấy seat "locked" until refresh
- **Solution needed**: Khi cron release seat → emit `seat.released` event

---

## 📊 Coverage Matrix

| Notification Type      | Source            | Emit Path                                     | DB Save | Email | In-App | WebSocket |
| ---------------------- | ----------------- | --------------------------------------------- | ------- | ----- | ------ | --------- |
| `BOOKING_INCOMPLETE`   | Create booking    | `bookingService.createBooking()`              | ✅      | ❓    | ✅     | ✅        |
| `BOOKING_INCOMPLETE`   | Update booking    | `bookingService.updateBooking()`              | ✅      | ❓    | ✅     | ✅        |
| `BOOKING_INCOMPLETE`   | Cron expire       | `bookingService.expirePendingBooking()`       | ✅      | ❓    | ✅     | ✅        |
| `BOOKING_CONFIRMATION` | Payment webhook   | `paymentService.handlePaymentWebhook()`       | ✅      | ✅    | ✅     | ✅        |
| `TRIP_LIVE_UPDATE`     | Admin update trip | `tripService.updateTrip()`                    | ✅      | ❓    | ✅     | ✅        |
| `TRIP_REMINDER_24H`    | Cron reminder     | `notificationService.processReminderWindow()` | ✅      | ✅    | ✅     | ❌        |
| `TRIP_REMINDER_3H`     | Cron reminder     | `notificationService.processReminderWindow()` | ✅      | ✅    | ✅     | ❌        |

Legend:

- ✅ = Implemented
- ❌ = Not needed / Not implemented
- ❓ = Conditional on notification preference

---

## 🎯 Recommendations

### Priority 1: Fix Trip Status Broadcast

Thêm event broadcast khi trip status change:

```typescript
// In trip.service.ts updateTrip()
this.eventEmitter.emit('trip.updated', {
  tripId: id,
  oldStatus,
  newStatus,
  updatedAt: new Date(),
});
```

Then handle in realtime service:

```typescript
// In realtime.service.ts
@OnEvent('trip.updated')
broadcastTripUpdate(payload: TripUpdatedEvent) {
  this.io.emit('trip:updated', payload);
}
```

### Priority 2: Real-time Seat Release Notification

Thêm event khi cron release seats:

```typescript
// In seat-status.service.ts releaseLockedSeats()
const released = await this.seatStatusRepository.releaseSeatLocks(timeCheck);
if (released > 0) {
  this.eventEmitter.emit('seats.released', {
    tripId,
    seatIds: [...],
    timestamp: new Date(),
  });
}
```

Then emit realtime:

```typescript
@OnEvent('seats.released')
broadcastSeatsReleased(payload: SeatsReleasedEvent) {
  this.io.emit('seats:released', payload);
}
```

### Priority 3: Check Email Notification Preferences

Confirm that email sending respects user preferences:

```typescript
const userPreference = await this.notificationService.getUserPreference(userId);
if (userPreference.emailRemindersEnabled) {
  // Send email
}
```

---

## Summary

- ✅ **All 5 notification types** have emit points
- ✅ **Event listeners** are properly registered
- ✅ **Database persistence** is working
- ❌ **Realtime broadcast** needs enhancement for trip/seat updates
- ❓ **Email sending** should respect user preferences (verify)
