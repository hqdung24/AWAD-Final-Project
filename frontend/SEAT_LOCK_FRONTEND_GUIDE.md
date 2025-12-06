# Frontend Integration Guide - Seat Lock API

## Quick Start

### 1. Lock Seats After Selection

```typescript
// frontend/src/services/seatStatusService.ts

import { http } from '@/lib/http';

interface LockSeatsRequest {
  trip_id: string;
  seat_ids: string[];
}

interface LockSeatsResponse {
  success: true;
  trip_id: string;
  seat_ids: string[];
  locked_until: string; // ISO 8601
  lock_token: string;
}

interface LockSeatsError {
  success: false;
  error: string;
  message?: string;
  seat?: string;
  locked_until?: string;
}

export async function lockSeats(
  tripId: string,
  seatIds: string[]
): Promise<LockSeatsResponse | LockSeatsError> {
  try {
    const response = await http.post<LockSeatsResponse>('/seat-status/lock', {
      trip_id: tripId,
      seat_ids: seatIds,
    });

    if (response.success) {
      return response;
    }

    return response as LockSeatsError;
  } catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to lock seats. Please try again.',
    };
  }
}
```

### 2. Use in Seat Selection Component

```typescript
// frontend/src/pages/search/SeatSelection.tsx

import { useState } from 'react';
import { useNotify } from '@/lib/notify';
import { lockSeats } from '@/services/seatStatusService';

export function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const notify = useNotify();

  // Track countdown
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const handleProceedToBooking = async () => {
    if (selectedSeats.length === 0) {
      notify.error('Please select at least one seat');
      return;
    }

    setIsLocking(true);

    try {
      const response = await lockSeats(tripId, selectedSeats);

      if (!response.success) {
        handleLockError(response);
        return;
      }

      // Success
      setLockToken(response.lock_token);
      const lockUntilTime = new Date(response.locked_until);
      setLockedUntil(lockUntilTime);

      // Start countdown
      const expiresIn = lockUntilTime.getTime() - Date.now();
      setTimeRemaining(Math.floor(expiresIn / 1000));

      notify.success(
        `Seats locked! Lock expires in ${Math.floor(expiresIn / 60000)} minutes`
      );

      // Navigate to booking
      navigate('/booking', {
        state: {
          tripId,
          seatIds: selectedSeats,
          lockToken: response.lock_token,
          lockedUntil: lockUntilTime,
        },
      });
    } catch (error) {
      notify.error('Failed to lock seats. Please try again.');
    } finally {
      setIsLocking(false);
    }
  };

  const handleLockError = (response: LockSeatsError) => {
    switch (response.error) {
      case 'TRIP_NOT_FOUND':
        notify.error('This trip is no longer available. Please search again.');
        navigate('/search');
        break;

      case 'TRIP_UNAVAILABLE':
        notify.error(response.message || 'Trip is no longer available.');
        navigate('/search');
        break;

      case 'SEAT_LOCKED':
        notify.error(
          `Seat ${response.seat} is locked by another user until ${new Date(
            response.locked_until!
          ).toLocaleTimeString()}. Please select different seats.`
        );
        // Deselect the locked seat
        setSelectedSeats(selectedSeats.filter((id) => id !== response.seat));
        break;

      case 'SEAT_BOOKED':
        notify.error(
          `Seat ${response.seat} is already booked. Please select a different seat.`
        );
        // Deselect the booked seat
        setSelectedSeats(selectedSeats.filter((id) => id !== response.seat));
        break;

      case 'SEAT_NOT_FOUND':
        notify.error(response.message || 'Some seats are invalid.');
        // Reload seat map
        window.location.reload();
        break;

      case 'NETWORK_ERROR':
        notify.error(response.message || 'Network error. Please try again.');
        break;

      default:
        notify.error('Failed to lock seats. Please try again.');
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newValue = (prev ?? 0) - 1;

        // Warn when < 2 minutes
        if (newValue === 120) {
          notify.warning('Your seat lock will expire in 2 minutes!');
        }

        // Expired
        if (newValue <= 0) {
          clearInterval(interval);
          notify.error('Seat lock expired. Please select seats again.');
          setLockToken(null);
          setSelectedSeats([]);
          return null;
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, notify]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Seat map component */}
      <SeatMap
        seats={seats}
        selectedSeats={selectedSeats}
        onSelectSeat={(seatId) => {
          setSelectedSeats([...selectedSeats, seatId]);
        }}
        onDeselectSeat={(seatId) => {
          setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
        }}
      />

      {/* Lock status display */}
      {lockToken && timeRemaining !== null && (
        <div className="lock-status">
          <p>🔒 Seats locked until {lockedUntil?.toLocaleTimeString()}</p>
          <p
            className="countdown"
            style={{
              color: timeRemaining < 120 ? '#ff6b6b' : '#51cf66',
            }}
          >
            Expires in: {formatTime(timeRemaining)}
          </p>
        </div>
      )}

      {/* Proceed button */}
      <button
        onClick={handleProceedToBooking}
        disabled={selectedSeats.length === 0 || isLocking}
      >
        {isLocking ? 'Locking seats...' : 'Proceed to Booking'}
      </button>
    </div>
  );
}
```

### 3. Pass Lock Token to Booking API

```typescript
// frontend/src/pages/booking/BookingPage.tsx

import { useLocation } from 'react-router-dom';

export function BookingPage() {
  const location = useLocation();
  const { tripId, seatIds, lockToken, lockedUntil } = location.state;

  const handleCreateBooking = async (passengerInfo: PassengerInfo) => {
    // Include lock_token in booking request
    const response = await createBooking({
      trip_id: tripId,
      seat_ids: seatIds,
      lock_token: lockToken, // Important!
      passenger_info: passengerInfo,
    });

    if (response.success) {
      navigate('/payment', {
        state: {
          bookingId: response.booking_id,
          amount: response.amount,
        },
      });
    }
  };

  return (
    <div>
      <p>🔒 Seats locked until {new Date(lockedUntil).toLocaleString()}</p>
      <BookingForm
        tripId={tripId}
        seatIds={seatIds}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
}
```

## Error Handling Strategy

### Decision Tree

```
Response Received
├─ success: true
│  └─ Store lock_token & proceed to booking
│
└─ success: false
   ├─ error: TRIP_NOT_FOUND or TRIP_UNAVAILABLE
   │  └─ Show message & redirect to search
   │
   ├─ error: SEAT_LOCKED
   │  └─ Show seat info & lock expiration
   │  └─ Suggest retry or select different seats
   │
   ├─ error: SEAT_BOOKED
   │  └─ Show seat unavailable message
   │  └─ Deselect seat & reload seat status
   │
   ├─ error: SEAT_NOT_FOUND
   │  └─ Reload entire seat map
   │
   └─ error: NETWORK_ERROR
      └─ Show retry button with exponential backoff
```

### Sample Error Component

```typescript
// frontend/src/components/LockErrorDisplay.tsx

interface LockErrorDisplayProps {
  error: LockSeatsError;
  onRetry: () => void;
  onSelectDifferentSeats: () => void;
}

export function LockErrorDisplay({
  error,
  onRetry,
  onSelectDifferentSeats,
}: LockErrorDisplayProps) {
  if (error.success !== false) return null;

  return (
    <div className="lock-error">
      {error.error === 'SEAT_LOCKED' && (
        <div>
          <p>❌ Seat {error.seat} is locked by another user</p>
          <p>
            Available again at:{' '}
            {new Date(error.locked_until!).toLocaleTimeString()}
          </p>
          <button onClick={onRetry}>Try Again</button>
          <button onClick={onSelectDifferentSeats}>
            Select Different Seats
          </button>
        </div>
      )}

      {error.error === 'SEAT_BOOKED' && (
        <div>
          <p>❌ Seat {error.seat} is already booked</p>
          <button onClick={onSelectDifferentSeats}>
            Select Different Seats
          </button>
        </div>
      )}

      {(error.error === 'TRIP_NOT_FOUND' ||
        error.error === 'TRIP_UNAVAILABLE') && (
        <div>
          <p>⚠️ {error.message || 'This trip is no longer available'}</p>
          <button onClick={() => navigate('/search')}>Back to Search</button>
        </div>
      )}

      {error.error === 'NETWORK_ERROR' && (
        <div>
          <p>🌐 {error.message || 'Network error'}</p>
          <button onClick={onRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

## Countdown Implementation

```typescript
// frontend/src/hooks/useLockCountdown.ts

import { useState, useEffect } from 'react';

export function useLockCountdown(lockedUntil: Date | null) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!lockedUntil) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const expiresAt = new Date(lockedUntil).getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
      } else {
        setTimeRemaining(remaining);
        setIsWarning(remaining < 120); // Less than 2 minutes
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    isExpired,
    isWarning,
    formatted: timeRemaining ? format(timeRemaining) : null,
  };
}
```

## Best Practices

### 1. Always Store Lock Token

```typescript
// Store in sessionStorage (cleared on tab close)
sessionStorage.setItem('lockToken', response.lock_token);
sessionStorage.setItem('tripId', response.trip_id);
sessionStorage.setItem('seatIds', JSON.stringify(response.seat_ids));
```

### 2. Validate Lock Before Booking

```typescript
// Before creating booking, verify lock is still valid
const validatedLock = await validateLockToken(lockToken);
if (!validatedLock) {
  // Lock expired, ask user to re-lock seats
  notify.error('Lock expired. Please select seats again.');
  navigate('/search');
}
```

### 3. Handle Lock Expiration Gracefully

```typescript
// Show warning 2 minutes before expiration
useEffect(() => {
  if (timeRemaining === 120) {
    notify.warning('Your seat lock expires in 2 minutes!');
    // Optional: Prompt user to complete booking
  }
}, [timeRemaining]);
```

### 4. Implement Exponential Backoff for Retry

```typescript
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;

      // Wait 2^retries seconds
      const delay = Math.pow(2, retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
```

### 5. Cancel Booking and Unlock if Needed

```typescript
// When user cancels booking before payment
const handleCancelBooking = async () => {
  if (lockToken) {
    // Call unlock endpoint
    await unlockSeats(lockToken);
    sessionStorage.removeItem('lockToken');
  }
  navigate('/search');
};
```

## Testing Checklist

- [ ] Select 1-3 seats and lock successfully
- [ ] Verify countdown timer works
- [ ] Verify warning at 2 minutes
- [ ] Verify lock expiration handling
- [ ] Test concurrent lock attempt (different user)
- [ ] Test seat already booked error
- [ ] Test trip not found error
- [ ] Test network error and retry
- [ ] Test lock token passed to booking
- [ ] Test unlock on booking cancellation

## API Response Examples

### Success

```json
{
  "success": true,
  "trip_id": "550e8400-e29b-41d4-a716-446655440000",
  "seat_ids": ["A1", "A2"],
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
  "seat": "A1",
  "locked_until": "2025-02-20T09:25:00.000Z"
}
```

## Troubleshooting

### Q: Lock expires too quickly

**A:** Check `SEAT_LOCK_DURATION` env variable on backend (default 600s = 10 min)

### Q: Countdown shows negative time

**A:** Client and server time are out of sync. Use server time from response.

### Q: Lock token rejected at booking

**A:** Token may have expired. Re-lock seats and try again.

### Q: Same seat available again too quickly

**A:** Cron job clears expired locks every 1 minute. Wait for cleanup.
