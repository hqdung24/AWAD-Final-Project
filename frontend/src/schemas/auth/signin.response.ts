import { z } from 'zod';

export const MeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  hasSetPassword: z.boolean(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  username: z.string().nullable(),
});
export type Me = z.infer<typeof MeSchema>;

// BE best-practice: RT ở HttpOnly cookie, FE chỉ nhận AT + user
export const SigninResponseSchema = z.object({
  accessToken: z.string(),
  user: MeSchema,
});
export type SigninResponse = z.infer<typeof SigninResponseSchema>;
