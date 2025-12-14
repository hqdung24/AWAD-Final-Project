export const PAYMENT_EMAIL_SUBJECTS = {
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_SUCCESS: 'Payment Successful',
  PAYMENT_FAILED: 'Payment Failed',
} as const;

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

type BasePaymentParams = {
  bookingId: string;
  bookingReference?: string | null;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string | null;
  seats: string[];
  passengers: PassengerInfo[];
  contact: ContactInfo;
  amount: number;
  orderCode: number;
};

export type PaymentInitiatedParams = BasePaymentParams & {
  checkoutUrl: string;
  paymentDeadline?: string;
  manageBookingUrl?: string;
};

export type PaymentSuccessParams = BasePaymentParams & {
  transactionRef: string;
  manageBookingUrl?: string;
};

export type PaymentFailedParams = BasePaymentParams & {
  manageBookingUrl?: string;
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

const renderPassengers = (passengers: PassengerInfo[]) =>
  passengers
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

const cardShell = (heading: string, subtitle: string, body: string) => `
  <div style="max-width:680px;margin:24px auto;background:#fff;border:1px solid ${colors.border};border-radius:16px;overflow:hidden;box-shadow:0 24px 60px -24px rgba(0,88,186,0.25);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="background:linear-gradient(120deg, ${colors.primary}, ${colors.accent});color:#fff;padding:24px 28px 20px;">
      <div style="font-size:12px;letter-spacing:0.02em;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.14);display:inline-block;">${heading}</div>
      <div style="margin:10px 0 4px;font-size:22px;font-weight:700;">${subtitle}</div>
    </div>
    ${body}
  </div>`;

export function getPaymentInitiatedTemplate(params: PaymentInitiatedParams) {
  const seatsLine = params.seats.length ? params.seats.join(', ') : '—';
  const passengers = renderPassengers(params.passengers);
  const deadline = params.paymentDeadline
    ? formatDateTime(params.paymentDeadline)
    : '—';

  const body = `
    <div style="padding:24px 28px;border-top:1px solid ${colors.border};">
      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:${colors.muted};">Payment created</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 18px;">
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Order code</div>
          <div style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${params.orderCode}</div>
        </div>
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Amount</div>
          <div style="margin-top:4px;font-size:18px;font-weight:800;color:${colors.accent};">${formatCurrency(params.amount)}</div>
        </div>
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Pay before</div>
          <div style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${deadline}</div>
        </div>
      </div>

      <div style="margin-top:18px;padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
        <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Trip</div>
        <div style="margin-top:6px;font-size:15px;font-weight:700;color:${colors.text};">${params.origin} → ${params.destination}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Departure: ${formatDateTime(params.departureTime)}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Arrival (est): ${formatDateTime(params.arrivalTime)}</div>
        <div style="margin-top:6px;font-size:13px;color:${colors.text};">Seats: ${seatsLine}</div>
      </div>

      <h4 style="margin:18px 0 8px;font-size:14px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.04em;">Passengers</h4>
      <table style="width:100%;border-collapse:collapse;margin-top:6px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Name</th>
            <th style="text-align:center;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Seat</th>
            <th style="text-align:right;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Document</th>
          </tr>
        </thead>
        <tbody>${passengers}</tbody>
      </table>

      <div style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 18px;">
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Contact</div>
          <div style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${params.contact.name || '—'}</div>
          <div style="font-size:13px;color:${colors.muted};">${params.contact.email || '—'}</div>
          <div style="font-size:13px;color:${colors.muted};">${params.contact.phone || '—'}</div>
        </div>
      </div>

      <a href="${params.checkoutUrl}" style="display:inline-block;margin-top:16px;padding:14px 18px;background:${colors.primary};color:#fff;text-decoration:none;border-radius:12px;font-weight:700;box-shadow:0 12px 30px -14px ${colors.primary};">Continue to payment</a>
      ${
        params.manageBookingUrl
          ? `<div style="margin-top:10px;"><a style="color:${colors.primary};text-decoration:none;font-weight:600;" href="${params.manageBookingUrl}">View booking</a></div>`
          : ''
      }
      <p style="margin-top:12px;color:${colors.muted};font-size:13px;">Booking ID: ${params.bookingId}</p>
    </div>
  `;

  return cardShell(
    'Payment initiated',
    params.bookingReference || params.bookingId,
    body,
  );
}

export function getPaymentSuccessTemplate(params: PaymentSuccessParams) {
  const seatsLine = params.seats.length ? params.seats.join(', ') : '—';
  const passengers = renderPassengers(params.passengers);

  const body = `
    <div style="padding:24px 28px;border-top:1px solid ${colors.border};">
      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:${colors.muted};">Payment confirmed</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 18px;">
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div class="label" style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Order code</div>
          <div class="value" style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${params.orderCode}</div>
        </div>
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div class="label" style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Amount</div>
          <div class="value" style="margin-top:4px;font-size:18px;font-weight:800;color:${colors.accent};">${formatCurrency(params.amount)}</div>
        </div>
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div class="label" style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Transaction</div>
          <div class="value" style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${params.transactionRef}</div>
        </div>
      </div>

      <div style="margin-top:18px;padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
        <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Trip</div>
        <div style="margin-top:6px;font-size:15px;font-weight:700;color:${colors.text};">${params.origin} → ${params.destination}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Departure: ${formatDateTime(params.departureTime)}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Arrival (est): ${formatDateTime(params.arrivalTime)}</div>
        <div style="margin-top:6px;font-size:13px;color:${colors.text};">Seats: ${seatsLine}</div>
      </div>

      <h4 style="margin:18px 0 8px;font-size:14px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.04em;">Passengers</h4>
      <table style="width:100%;border-collapse:collapse;margin-top:6px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Name</th>
            <th style="text-align:center;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Seat</th>
            <th style="text-align:right;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Document</th>
          </tr>
        </thead>
        <tbody>${passengers}</tbody>
      </table>

      <p style="margin-top:16px;color:${colors.muted};font-size:13px;">Booking reference: ${params.bookingReference || params.bookingId}</p>
      ${
        params.manageBookingUrl
          ? `<a style="display:inline-block;margin-top:10px;color:${colors.primary};text-decoration:none;font-weight:700;" href="${params.manageBookingUrl}">View your e-ticket</a>`
          : ''
      }
    </div>
  `;

  return cardShell(
    'Payment successful',
    params.bookingReference || params.bookingId,
    body,
  );
}

export function getPaymentFailedTemplate(params: PaymentFailedParams) {
  const seatsLine = params.seats.length ? params.seats.join(', ') : '—';
  const passengers = renderPassengers(params.passengers);

  const body = `
    <div style="padding:24px 28px;border-top:1px solid ${colors.border};">
      <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:${colors.muted};">Payment failed</h3>
      <p style="margin:0 0 8px;color:${colors.text};">We could not complete your payment for booking ${params.bookingReference || params.bookingId}.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 18px;">
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Order code</div>
          <div style="margin-top:4px;font-size:15px;font-weight:700;color:${colors.text};">${params.orderCode}</div>
        </div>
        <div style="padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
          <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Amount</div>
          <div style="margin-top:4px;font-size:18px;font-weight:800;color:${colors.accent};">${formatCurrency(params.amount)}</div>
        </div>
      </div>

      <div style="margin-top:18px;padding:10px 12px;background:${colors.surface};border:1px solid ${colors.border};border-radius:10px;">
        <div style="font-size:12px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Trip</div>
        <div style="margin-top:6px;font-size:15px;font-weight:700;color:${colors.text};">${params.origin} → ${params.destination}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Departure: ${formatDateTime(params.departureTime)}</div>
        <div style="margin-top:2px;font-size:13px;color:${colors.muted};">Arrival (est): ${formatDateTime(params.arrivalTime)}</div>
        <div style="margin-top:6px;font-size:13px;color:${colors.text};">Seats: ${seatsLine}</div>
      </div>

      <h4 style="margin:18px 0 8px;font-size:14px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.04em;">Passengers</h4>
      <table style="width:100%;border-collapse:collapse;margin-top:6px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Name</th>
            <th style="text-align:center;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Seat</th>
            <th style="text-align:right;padding:10px 12px;background:${colors.surface};color:${colors.muted};font-size:12px;letter-spacing:0.03em;text-transform:uppercase;">Document</th>
          </tr>
        </thead>
        <tbody>${passengers}</tbody>
      </table>

      ${
        params.manageBookingUrl
          ? `<a style="display:inline-block;margin-top:12px;color:${colors.primary};text-decoration:none;font-weight:700;" href="${params.manageBookingUrl}">Try payment again</a>`
          : ''
      }
      <p style="margin-top:10px;color:${colors.muted};font-size:13px;">Booking ID: ${params.bookingId}</p>
    </div>
  `;

  return cardShell(
    'Payment failed',
    params.bookingReference || params.bookingId,
    body,
  );
}
