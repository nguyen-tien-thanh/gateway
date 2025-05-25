import { Module } from '@nestjs/common';

import { PermissionsService } from 'src/permission/permissions.service';
import { PermissionsController } from 'src/permission/permissions.controller';
import { PermissionRepository } from 'src/permission/permission.repository';

@Module({
  imports: [],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
  exports: [PermissionsService, PermissionRepository]
})
export class PermissionsModule {}
