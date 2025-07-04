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
    if (permitted) return true;

    return this.checkIfUserHavePermission(request.user, permissionPayload);
  }

  /**
   * check if route is default
   * @param permissionAgainst
   */
  checkIfDefaultRoute(permissionAgainst: RoutePayloadInterface) {
    const { path, method } = permissionAgainst;
    const defaultRoutes = PermissionConfiguration.defaultRoutes;
    return defaultRoutes.some((r) => r.path === path && r.method === method);
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

    if (!user?.role) return false;

    if (user.role.name === 'ADMIN') return true;

    return (
      user.role.permissions?.some((p) => {
        const methodMatch = p.method.toLowerCase() === method.toLowerCase();
        const pathMatch = p.path === path || path.startsWith(p.path);
        return methodMatch && pathMatch;
      }) ?? false
    );
  }
}
