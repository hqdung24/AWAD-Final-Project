export const PAYMENT_EMAIL_SUBJECTS = {
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_SUCCESS: 'Payment Successful',
  PAYMENT_FAILED: 'Payment Failed',
} as const;

export function getPaymentInitiatedTemplate(
  bookingId: string,
  orderCode: number,
  amount: number,
  checkoutUrl: string,
) {
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; line-height:1.5; color:#0f172a;">
      <h2 style="margin:0 0 12px">Payment Initiated</h2>
      <p>Your payment session has been created for booking <strong>${bookingId}</strong>.</p>
      <ul style="padding-left:16px">
        <li><strong>Order Code:</strong> ${orderCode}</li>
        <li><strong>Amount:</strong> ${amount.toLocaleString()} VND</li>
      </ul>
      <p>You can proceed to payment using the link below:</p>
      <p><a href="${checkoutUrl}" style="color:#2563eb">Go to Checkout</a></p>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="font-size:12px;color:#64748b">If you did not request this, please ignore this email.</p>
    </div>
  `;
}

export function getPaymentSuccessTemplate(
  bookingReference: string,
  orderCode: number,
  amount: number,
  transactionRef: string,
) {
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; line-height:1.5; color:#0f172a;">
      <h2 style="margin:0 0 12px">Payment Successful</h2>
      <p>Your payment has been confirmed for booking <strong>${bookingReference}</strong>.</p>
      <ul style="padding-left:16px">
        <li><strong>Order Code:</strong> ${orderCode}</li>
        <li><strong>Amount:</strong> ${amount.toLocaleString()} VND</li>
        <li><strong>Transaction Ref:</strong> ${transactionRef}</li>
      </ul>
      <p>Thank you for your purchase! Your e-ticket will be available in your account.</p>
    </div>
  `;
}

export function getPaymentFailedTemplate(
  bookingId: string,
  orderCode: number,
  amount: number,
) {
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; line-height:1.5; color:#0f172a;">
      <h2 style="margin:0 0 12px">Payment Failed</h2>
      <p>Your payment could not be completed for booking <strong>${bookingId}</strong>.</p>
      <ul style="padding-left:16px">
        <li><strong>Order Code:</strong> ${orderCode}</li>
        <li><strong>Amount:</strong> ${amount.toLocaleString()} VND</li>
      </ul>
      <p>You can retry from the Upcoming Trips page, or contact support.</p>
    </div>
  `;
}
