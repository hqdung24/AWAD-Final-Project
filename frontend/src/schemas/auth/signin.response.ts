import { z } from 'zod';

export const MeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});
export type Me = z.infer<typeof MeSchema>;

// BE best-practice: RT ở HttpOnly cookie, FE chỉ nhận AT + user
export const SigninResponseSchema = z.object({
  accessToken: z.string(),
  user: MeSchema,
});
export type SigninResponse = z.infer<typeof SigninResponseSchema>;
