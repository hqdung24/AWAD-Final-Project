import { z } from 'zod';
export const SignupResponseSchema = z.object({
  msg: z.string(),
});
export type SignupResponse = z.infer<typeof SignupResponseSchema>;
