import { z } from 'zod';
export const SignupPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
export type SignupPayload = z.infer<typeof SignupPayloadSchema>;
