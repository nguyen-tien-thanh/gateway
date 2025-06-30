import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Type
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ExceptionTitleList } from '../constants/exception-title-list.constants';

export function OwnerGuard(resourceName: string): Type<CanActivate> {
  @Injectable()
  class OwnerGuardWithResource implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (user && user.role?.name === 'ADMIN') return true;

      const resourceId = request.params.id;

      const resource = await this.prisma[resourceName].findUnique({
        where: { id: Number(resourceId) },
        select: { createdBy: true }
      });

      if (!resource || resource.createdBy !== user.id) {
        throw new ForbiddenException(ExceptionTitleList.Forbidden);
      }

      return true;
    }
  }

  return OwnerGuardWithResource;
}
