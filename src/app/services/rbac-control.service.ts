import { Injectable } from '@angular/core';
import { USERS_PERMISSIONS } from '../modules/management/models/users-permissions';
import { SECURITY_PERMISSIONS } from '../modules/management/models/security-permissions';
import { QUALITY_LIFE_PERMISSIONS } from '../modules/management/models/qualityLife-permissions';
import { PHYSICAL_SECURITY_PERMISSIONS } from '../modules/management/models/physicalSecurity-permissions';
import { RbacPermissions } from '../modules/management/models/rbac-permissions';


@Injectable({
  providedIn: 'root'
})
export class RbacControlService {

  constructor() { }
  getPermissions(rolId: number) {
    let permission!: RbacPermissions;
    switch (rolId) {
      case 1:
        permission = USERS_PERMISSIONS;
        break;
      case 2:
        permission = SECURITY_PERMISSIONS;
        break;
      case 3:
        permission = QUALITY_LIFE_PERMISSIONS;
      break;
      case 4:
        permission = PHYSICAL_SECURITY_PERMISSIONS;
      break;
    }
    return permission;
  }
}
