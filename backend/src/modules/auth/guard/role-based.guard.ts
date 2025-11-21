import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  REQUEST_ROLE_TYPE_KEY,
  REQUEST_USER_KEY,
} from '@/constants/auth.constant';
import { RoleType } from '../enums/roles-type.enum';
import { AccessControlProvider } from '../providers/access-control.provider';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlProvider: AccessControlProvider,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      REQUEST_ROLE_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    //Get request from context
    const request: Request = context.switchToHttp().getRequest();

    const token = request[REQUEST_USER_KEY] as ActiveUserData;

    for (const role of requiredRoles) {
      const result = this.accessControlProvider.isAuthorized({
        requiredRole: role,
        currentRole: token.role as RoleType,
      });

      if (result) {
        return true;
      }
    }
    //if no roles matched, throw forbidden exception
    throw new ForbiddenException('Forbidden resource');
  }
}
