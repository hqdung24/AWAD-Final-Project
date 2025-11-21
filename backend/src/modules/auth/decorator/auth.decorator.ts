import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-type.enum';
import { REQUEST_AUTH_TYPE_KEY } from '@/constants/auth.constant';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(REQUEST_AUTH_TYPE_KEY, authTypes); // example: @Auth(AuthType.Bearer, AuthType.None)
