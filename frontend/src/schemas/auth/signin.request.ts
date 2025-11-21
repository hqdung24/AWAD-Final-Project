import { z } from 'zod';

export const SigninPayloadSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(6),
});
export type SigninPayload = z.infer<typeof SigninPayloadSchema>;
