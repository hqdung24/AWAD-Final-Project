// src/services/authService.ts
import { http } from '@/lib/http';
import {
  SigninPayloadSchema,
  type SigninPayload,
} from '@/schemas/auth/signin.request';
import {
  SigninResponseSchema,
  type SigninResponse,
} from '@/schemas/auth/signin.response';
import {
  SignupPayloadSchema,
  type SignupPayload,
} from '@/schemas/auth/signup.request';
import {
  SignupResponseSchema,
  type SignupResponse,
} from '@/schemas/auth/signup.response';
import { MeResponseSchema, type MeResponse } from '@/schemas/user/me.response';

export async function signin(payload: SigninPayload): Promise<SigninResponse> {
  // tuỳ chọn: validate payload client-side
  SigninPayloadSchema.parse(payload);

  const res = await http.post('/auth/signin', payload);
  return SigninResponseSchema.parse(res.data);
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  SignupPayloadSchema.parse(payload);
  const res = await http.post('/auth/signup', payload);
  return SignupResponseSchema.parse(res.data);
}

export async function signout(): Promise<void> {
  await http.post('/auth/signout');
}

export async function getMe(): Promise<MeResponse> {
  const res = await http.get('/users/me');
  return MeResponseSchema.parse(res.data);
}
