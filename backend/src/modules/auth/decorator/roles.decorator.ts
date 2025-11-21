import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enums/roles-type.enum';
import { REQUEST_ROLE_TYPE_KEY } from '@/constants/auth.constant';

export const Roles = (...role: RoleType[]) =>
  SetMetadata(REQUEST_ROLE_TYPE_KEY, role); // example: @Roles(RoleType.ADMIN, RoleType.USER)
