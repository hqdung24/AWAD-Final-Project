import { z } from 'zod';
import { MeSchema } from '@/schemas/auth/signin.response';
export const MeResponseSchema = MeSchema;
export type MeResponse = z.infer<typeof MeResponseSchema>;
