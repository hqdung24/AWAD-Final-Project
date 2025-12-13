import { z } from 'zod';

export const paymentLinkStatusSchema = z.string();

export const createPaymentLinkResponseSchema = z.object({
  bin: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  amount: z.number(),
  description: z.string(),
  orderCode: z.number(),
  currency: z.string(),
  paymentLinkId: z.string(),
  status: paymentLinkStatusSchema,
  expiredAt: z.number().optional(),
  checkoutUrl: z.string(),
  qrCode: z.string(),
});

export type PaymentLinkStatus = z.infer<typeof paymentLinkStatusSchema>;
export type CreatePaymentLinkResponse = z.infer<
  typeof createPaymentLinkResponseSchema
>;
