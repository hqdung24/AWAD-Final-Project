export const BOOKING_EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
};

export const BOOKING_EMAIL_SUBJECTS = {
  BOOKING_CONFIRMATION: 'Booking Confirmation - Complete Your Payment',
};

export const getBookingConfirmationTemplate = (
  bookingId: string,
  bookingReference: string | null,
  origin: string,
  destination: string,
  departureTime: string,
  totalAmount: number,
  timeRemaining: string = '12:00:00',
): string => {
  const departureDate = new Date(departureTime).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const departureTimeFormatted = new Date(departureTime).toLocaleTimeString(
    'vi-VN',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );

  const totalAmountFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalAmount);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #f9fafb;
          padding: 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .header {
          background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 12px;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .trip-info {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .trip-location {
          flex: 1;
        }
        .trip-origin,
        .trip-destination {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .trip-arrow {
          color: #9ca3af;
          font-size: 18px;
        }
        .booking-details {
          background-color: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #d1d5db;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }
        .timer-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .timer-label {
          font-size: 12px;
          color: #92400e;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .timer-value {
          font-size: 36px;
          font-weight: 700;
          color: #d97706;
          font-family: 'Courier New', monospace;
        }
        .timer-text {
          font-size: 12px;
          color: #b45309;
          margin-top: 8px;
        }
        .action-button {
          display: block;
          background-color: #d946ef;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          text-align: center;
          font-weight: 700;
          margin: 20px 0;
          font-size: 16px;
        }
        .action-button:hover {
          background-color: #c026d3;
        }
        .steps {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
        }
        .steps-title {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .step {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 13px;
        }
        .step-number {
          background-color: #d946ef;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: 700;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>✓ Booking Confirmed!</h1>
            <p>Your booking has been successfully created</p>
          </div>

          <div class="content">
            <!-- Trip Information -->
            <div class="section">
              <div class="section-title">Trip Information</div>
              <div class="trip-info">
                <div class="trip-location">
                  <div class="trip-origin">${origin}</div>
                  <div class="trip-arrow" style="font-size: 14px;">→</div>
                  <div class="trip-destination">${destination}</div>
                </div>
              </div>

              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${departureDate}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Departure Time:</span>
                <span class="detail-value">${departureTimeFormatted}</span>
              </div>
            </div>

            <!-- Booking Details -->
            <div class="section">
              <div class="section-title">Booking Details</div>
              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value" style="font-family: monospace;">${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reference:</span>
                  <span class="detail-value">${bookingReference || '—'}</span>
                </div>
                <div class="amount-row" style="border-bottom: none;">
                  <span>Total Amount:</span>
                  <span style="color: #d946ef;">${totalAmountFormatted}</span>
                </div>
              </div>
            </div>

            <!-- Payment Timer -->
            <div class="timer-section">
              <div class="timer-label">⏱️ Complete Payment Within</div>
              <div class="timer-value">${timeRemaining}</div>
              <div class="timer-text">Payment must be completed to finalize your booking</div>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 25px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                Click the button below to proceed with payment and receive your e-ticket.
              </p>
              <a href="https://busticket.com/payment/${bookingId}" class="action-button">
                Complete Payment Now
              </a>
            </div>

            <!-- Next Steps -->
            <div class="section">
              <div class="section-title">Next Steps</div>
              <div class="steps">
                <div class="steps-title">Please follow these steps to complete your booking:</div>
                <div class="step">
                  <div class="step-number">1</div>
                  <div>Click "Complete Payment Now" button above</div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div>Review and confirm payment details</div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div>Receive your e-ticket via email upon confirmation</div>
                </div>
                <div class="step">
                  <div class="step-number">4</div>
                  <div>Check your bookings in the "Upcoming Trips" section</div>
                </div>
              </div>
            </div>

            <!-- Important Notice -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 13px;">
              <strong style="color: #dc2626;">⚠️ Important:</strong>
              <p style="margin: 8px 0 0 0; color: #666;">
                Your booking will be automatically cancelled if payment is not completed within 12 hours. 
                Please complete payment as soon as possible to secure your seat.
              </p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            © ${new Date().getFullYear()} Bus Ticket Booking. All rights reserved.<br>
            This email was sent automatically. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
