import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../enums/auth-type.enum';
import { REQUEST_AUTH_TYPE_KEY } from '@/constants/auth.constant';
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    //other guard strategy injections

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
    ) ?? [AuthenticationGuard.defaultAuthType];

    //array of guards should be a flat map, in case multiple auth types are provided
    const guards = authTypes.flatMap(
      (authType) => this.authTypeToGuardMap[authType],
    );

    //handle execution of multiple guards
    for (const guard of guards) {
      const result = await Promise.resolve(guard.canActivate(context));
      if (result) return true;
    }
    throw new UnauthorizedException('Unauthorized request');
  }
}
