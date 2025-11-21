import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../guard/access-token.guard';
import { AuthType } from '../enums/auth-type.enum';

import { REQUEST_AUTH_TYPE_KEY } from '@/constants/auth.constant';
import { REQUEST_ROLE_TYPE_KEY } from '@/constants/auth.constant';
import { RoleGuard } from '../guard/role-based.guard';
import { RoleType } from '../enums/roles-type.enum';
@Injectable()
export class MyAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    //inject role based guard
    private readonly roleGuard: RoleGuard,

    //inject access token guard
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeToGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: {
        canActivate: () => true,
      },
    };
  }

  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeToGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //auth metadata from reflector
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      REQUEST_AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [MyAuthGuard.defaultAuthType];

    //array of guards should be a flat map, in case multiple auth types are provided
    const guards = authTypes.flatMap(
      (authType) => this.authTypeToGuardMap[authType],
    );

    //add role guard if roles are defined
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      REQUEST_ROLE_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    //check if roles are required, then add role guard
    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      authTypes.includes(AuthType.Bearer) // only add role guard for bearer auth
    ) {
      guards.push(this.roleGuard);
    }

    //handle execution of multiple guards
    for (const guard of guards) {
      const result = await Promise.resolve(guard.canActivate(context));
      if (!result) {
        throw new UnauthorizedException('Unauthorized request');
      }
    }
    return true;
  }
}
