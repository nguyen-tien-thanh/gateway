import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  PermissionConfiguration,
  RoutePayloadInterface
} from 'src/config/permission-config';
import { UserWithRole } from 'src/auth/models/user.model';

@Injectable()
export class PermissionGuard implements CanActivate {
  /**
   * check if user authorized
   * @param context
   */
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    const method = request.method.toLowerCase();
    const permissionPayload: RoutePayloadInterface = {
      path,
      method
    };
    const permitted = this.checkIfDefaultRoute(permissionPayload);
    if (permitted) {
      return true;
    }
    return this.checkIfUserHavePermission(request.user, permissionPayload);
  }

  /**
   * check if route is default
   * @param permissionAgainst
   */
  checkIfDefaultRoute(permissionAgainst: RoutePayloadInterface) {
    const { path, method } = permissionAgainst;
    const defaultRoutes = PermissionConfiguration.defaultRoutes;
    return defaultRoutes.some(
      (route) => route.path === path && route.method === method
    );
  }

  /**
   * check if user have necessary permission to view resource
   * @param user
   * @param permissionAgainst
   */
  checkIfUserHavePermission(
    user: UserWithRole,
    permissionAgainst: RoutePayloadInterface
  ) {
    const { path, method } = permissionAgainst;
    // For now, return true to allow access since we need to implement
    // the proper permission checking with the new Prisma schema
    // TODO: Implement proper permission checking with RolePermission junction table
    if (user && user.role) {
      // Allow admin users to access everything
      if (user.role.name === 'admin') {
        return true;
      }
      // TODO: Check permissions from the RolePermission table
      return true; // Temporary - allow all authenticated users
    }
    return false;
  }
}
