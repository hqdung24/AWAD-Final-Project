export const BOOKING_EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  TRIP_REMINDER: 'trip_reminder',
  BOOKING_CANCELLED: 'booking_cancelled',
};

export const BOOKING_EMAIL_SUBJECTS = {
  BOOKING_CONFIRMATION: 'Booking Created – Complete Your Payment',
  TRIP_REMINDER: 'Upcoming Trip Reminder',
  BOOKING_CANCELLED: 'Trip Cancelled – We’re Sorry',
};

type PassengerInfo = {
  fullName?: string | null;
  seatCode?: string | null;
  documentId?: string | null;
};

type ContactInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type BookingConfirmationParams = {
  bookingId: string;
  bookingReference?: string | null;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string | null;
  seats: string[];
  passengers: PassengerInfo[];
  contact: ContactInfo;
  totalAmount: number;
  paymentDeadline?: string; // ISO string
  paymentUrl?: string;
  manageBookingUrl?: string;
};

export type TripReminderParams = {
  bookingId: string;
  bookingReference?: string | null;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string | null;
  seats: string[];
  passengers: PassengerInfo[];
  contact: ContactInfo;
  reminderType: '24h' | '3h';
  manageBookingUrl?: string;
};

export type BookingCancelledParams = {
  bookingId: string;
  bookingReference?: string | null;
  origin: string;
  destination: string;
  departureTime: string;
  seats: string[];
  contact: ContactInfo;
  reason?: string;
};

const colors = {
  primary: '#0058ba',
  accent: '#e2308c',
  surface: '#f7f9fb',
  text: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

const formatCountdown = (deadline?: string) => {
  if (!deadline) return '—';
  const target = new Date(deadline).getTime();
  const diff = Math.max(target - Date.now(), 0);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

export const getBookingConfirmationTemplate = (
  params: BookingConfirmationParams,
): string => {
  const timeRemaining = formatCountdown(params.paymentDeadline);

  const passengers = params.passengers
    .map(
      (p, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#fff'}">
          <td style="padding:10px 12px; font-weight:600; color:${colors.text};">${p.fullName || '—'}</td>
          <td style="padding:10px 12px; color:${colors.text}; text-align:center;">${p.seatCode || '—'}</td>
          <td style="padding:10px 12px; color:${colors.muted}; text-align:right;">${p.documentId || '—'}</td>
        </tr>
      `,
    )
    .join('');

  const seatsLine = params.seats.length > 0 ? params.seats.join(', ') : '—';

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: ${colors.surface};
            color: ${colors.text};
          }
          .card {
            max-width: 680px;
            margin: 24px auto;
            background: #ffffff;
            border: 1px solid ${colors.border};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 24px 60px -24px rgba(0, 88, 186, 0.25);
          }
          .header {
            background: linear-gradient(120deg, ${colors.primary}, ${colors.accent});
            color: #fff;
            padding: 28px 28px 24px;
          }
          .pill {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.14);
            font-size: 12px;
            letter-spacing: 0.02em;
          }
          .title {
            margin: 12px 0 4px;
            font-size: 24px;
            font-weight: 700;
          }
          .subtitle {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .section {
            padding: 24px 28px;
            border-top: 1px solid ${colors.border};
          }
          .section h3 {
            margin: 0 0 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${colors.muted};
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 12px 18px;
          }
          .item {
            padding: 10px 12px;
            background: ${colors.surface};
            border: 1px solid ${colors.border};
            border-radius: 10px;
          }
          .label { font-size: 12px; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 0.03em; }
          .value { margin-top: 4px; font-size: 15px; font-weight: 700; color: ${colors.text}; }
          .amount { color: ${colors.accent}; font-weight: 800; font-size: 18px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .table th { text-align: left; padding: 10px 12px; background: ${colors.surface}; color: ${colors.muted}; font-size: 12px; letter-spacing: 0.03em; text-transform: uppercase; }
          .cta {
            display: inline-block;
            margin-top: 16px;
            padding: 14px 18px;
            background: ${colors.primary};
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            box-shadow: 0 12px 30px -14px ${colors.primary};
          }
          .cta:hover { opacity: 0.94; }
          .muted { color: ${colors.muted}; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="pill">Booking created</span>
            <div class="title">${params.origin} → ${params.destination}</div>
            <p class="subtitle">Reference: ${params.bookingReference || params.bookingId}</p>
          </div>

          <div class="section">
            <h3>Trip</h3>
            <div class="grid">
              <div class="item">
                <div class="label">Departure</div>
                <div class="value">${formatDateTime(params.departureTime)}</div>
              </div>
              <div class="item">
                <div class="label">Arrival (est)</div>
                <div class="value">${formatDateTime(params.arrivalTime)}</div>
              </div>
              <div class="item">
                <div class="label">Seats</div>
                <div class="value">${seatsLine}</div>
              </div>
              <div class="item">
                <div class="label">Amount</div>
                <div class="value amount">${formatCurrency(params.totalAmount)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Passengers</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style="text-align:center;">Seat</th>
                  <th style="text-align:right;">Document</th>
                </tr>
              </thead>
              <tbody>${passengers}</tbody>
            </table>
          </div>

          <div class="section">
            <h3>Contact & Payment</h3>
            <div class="grid">
              <div class="item">
                <div class="label">Contact</div>
                <div class="value">${params.contact.name || '—'}</div>
                <div class="muted">${params.contact.email || '—'}</div>
                <div class="muted">${params.contact.phone || '—'}</div>
              </div>
              <div class="item">
                <div class="label">Pay before</div>
                <div class="value">${formatDateTime(params.paymentDeadline)}</div>
                <div class="muted">Time remaining: ${timeRemaining}</div>
              </div>
            </div>
            ${
              params.paymentUrl
                ? `<a class="cta" href="${params.paymentUrl}">Complete payment</a>`
                : ''
            }
            ${
              params.manageBookingUrl
                ? `<div style="margin-top:10px;"><a style="color:${colors.primary}; text-decoration:none; font-weight:600;" href="${params.manageBookingUrl}">View booking details</a></div>`
                : ''
            }
            <p class="muted" style="margin-top:12px;">Booking ID: ${params.bookingId}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getTripReminderTemplate = (params: TripReminderParams): string => {
  const seatsLine = params.seats.length > 0 ? params.seats.join(', ') : '—';

  const passengers = params.passengers
    .map(
      (p, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#fff'}">
          <td style="padding:10px 12px; font-weight:600; color:${colors.text};">${p.fullName || '—'}</td>
          <td style="padding:10px 12px; color:${colors.text}; text-align:center;">${p.seatCode || '—'}</td>
          <td style="padding:10px 12px; color:${colors.muted}; text-align:right;">${p.documentId || '—'}</td>
        </tr>
      `,
    )
    .join('');

  const reminderLabel =
    params.reminderType === '24h'
      ? 'Reminder: your trip is tomorrow'
      : 'Reminder: your trip is soon';

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: ${colors.surface}; color: ${colors.text}; }
          .card { max-width: 680px; margin: 24px auto; background: #ffffff; border: 1px solid ${colors.border}; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px -24px rgba(0, 88, 186, 0.25); }
          .header { background: linear-gradient(120deg, ${colors.primary}, ${colors.accent}); color: #fff; padding: 24px 28px 20px; }
          .pill { display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.14); font-size: 12px; letter-spacing: 0.02em; }
          .title { margin: 10px 0 4px; font-size: 22px; font-weight: 700; }
          .subtitle { margin: 0; font-size: 14px; opacity: 0.9; }
          .section { padding: 24px 28px; border-top: 1px solid ${colors.border}; }
          .section h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; color: ${colors.muted}; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px 18px; }
          .item { padding: 10px 12px; background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: 10px; }
          .label { font-size: 12px; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 0.03em; }
          .value { margin-top: 4px; font-size: 15px; font-weight: 700; color: ${colors.text}; }
          .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .table th { text-align: left; padding: 10px 12px; background: ${colors.surface}; color: ${colors.muted}; font-size: 12px; letter-spacing: 0.03em; text-transform: uppercase; }
          .muted { color: ${colors.muted}; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="pill">${reminderLabel}</span>
            <div class="title">${params.origin} → ${params.destination}</div>
            <p class="subtitle">Reference: ${params.bookingReference || params.bookingId}</p>
          </div>

          <div class="section">
            <h3>Trip</h3>
            <div class="grid">
              <div class="item">
                <div class="label">Departure</div>
                <div class="value">${formatDateTime(params.departureTime)}</div>
              </div>
              <div class="item">
                <div class="label">Arrival (est)</div>
                <div class="value">${formatDateTime(params.arrivalTime)}</div>
              </div>
              <div class="item">
                <div class="label">Seats</div>
                <div class="value">${seatsLine}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Passengers</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style="text-align:center;">Seat</th>
                  <th style="text-align:right;">Document</th>
                </tr>
              </thead>
              <tbody>${passengers}</tbody>
            </table>
          </div>

          <div class="section">
            <h3>Contact</h3>
            <div class="grid">
              <div class="item">
                <div class="label">Contact name</div>
                <div class="value">${params.contact.name || '—'}</div>
                <div class="muted">${params.contact.email || '—'}</div>
                <div class="muted">${params.contact.phone || '—'}</div>
              </div>
            </div>
            ${
              params.manageBookingUrl
                ? `<div style="margin-top:10px;"><a style="color:${colors.primary}; text-decoration:none; font-weight:600;" href="${params.manageBookingUrl}">View booking details</a></div>`
                : ''
            }
            <p class="muted" style="margin-top:12px;">Booking ID: ${params.bookingId}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getBookingCancelledTemplate = (
  params: BookingCancelledParams,
): string => {
  const seatsLine = params.seats.length > 0 ? params.seats.join(', ') : '—';
  const reason = params.reason ?? 'The route for your trip was deactivated.';

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: ${colors.surface}; color: ${colors.text}; }
          .card { max-width: 680px; margin: 24px auto; background: #ffffff; border: 1px solid ${colors.border}; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px -24px rgba(0, 88, 186, 0.25); }
          .header { background: linear-gradient(120deg, ${colors.primary}, ${colors.accent}); color: #fff; padding: 24px 28px 20px; }
          .pill { display: inline-block; padding: 6px 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.14); font-size: 12px; letter-spacing: 0.02em; }
          .title { margin: 10px 0 4px; font-size: 22px; font-weight: 700; }
          .section { padding: 24px 28px; border-top: 1px solid ${colors.border}; }
          .item { padding: 10px 12px; background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: 10px; }
          .label { font-size: 12px; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 0.03em; }
          .value { margin-top: 4px; font-size: 15px; font-weight: 700; color: ${colors.text}; }
          .muted { color: ${colors.muted}; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="pill">Trip Cancelled</span>
            <div class="title">${params.origin} → ${params.destination}</div>
          </div>
          <div class="section">
            <div class="item">
              <div class="label">Reason</div>
              <div class="value">${reason}</div>
            </div>
            <div class="item" style="margin-top:12px;">
              <div class="label">Departure</div>
              <div class="value">${formatDateTime(params.departureTime)}</div>
              <div class="muted">Seats: ${seatsLine}</div>
              <div class="muted">Booking ref: ${params.bookingReference || params.bookingId}</div>
            </div>
            <div class="item" style="margin-top:12px;">
              <div class="label">Contact</div>
              <div class="value">${params.contact.name || '—'}</div>
              <div class="muted">${params.contact.email || '—'}</div>
              <div class="muted">${params.contact.phone || '—'}</div>
            </div>
            <p class="muted" style="margin-top:12px;">If you need help rebooking, please contact support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
