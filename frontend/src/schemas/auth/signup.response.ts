import { z } from 'zod';
export const SignupResponseSchema = z.object({
  message: z.string(),
});
export type SignupResponse = z.infer<typeof SignupResponseSchema>;
