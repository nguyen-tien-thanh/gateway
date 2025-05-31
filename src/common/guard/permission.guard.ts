import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  PermissionConfiguration,
  RoutePayloadInterface
} from 'src/config/permission-config';
import { UserWithRole } from 'src/modules/auth/models/user.model';

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

    if (!user || !user.role) return false;

    if (user.role.name === 'admin') return true;

    const hasPermission = user.role.permissions?.some((permission) => {
      return permission.path === path && permission.method === method;
    });

    return hasPermission || false;
  }
}
