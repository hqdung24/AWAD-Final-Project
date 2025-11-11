import { z } from 'zod';

export const SigninPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
export type SigninPayload = z.infer<typeof SigninPayloadSchema>;
