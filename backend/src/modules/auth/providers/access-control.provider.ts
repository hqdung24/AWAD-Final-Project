import { Injectable } from '@nestjs/common';
import { RoleType } from '../enums/roles-type.enum';

interface IsAuthorizedParams {
  currentRole: RoleType;
  requiredRole: RoleType;
}

@Injectable()
export class AccessControlProvider {
  private hierarchies: Array<Map<RoleType, number>> = [];

  constructor() {
    //define role hierarchy, higher number means higher privilege
    this.buildRoles([
      RoleType.GUEST,
      RoleType.USER,
      RoleType.ADMIN,
      RoleType.MODERATOR,
    ]);
  }

  private buildRoles(roles: RoleType[]) {
    const hierarchy: Map<RoleType, number> = new Map();

    let priority = 1;
    roles.forEach((role) => {
      hierarchy.set(role, priority);
      priority++;
    });

    this.hierarchies.push(hierarchy);
  }

  public isAuthorized({ currentRole, requiredRole }: IsAuthorizedParams) {
    for (const hierarchy of this.hierarchies) {
      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);

      if (
        priority !== undefined &&
        requiredPriority !== undefined &&
        priority >= requiredPriority
      ) {
        return true;
      }
    }

    return false;
  }
}
