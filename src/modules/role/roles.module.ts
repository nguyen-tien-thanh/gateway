import { forwardRef, Module } from '@nestjs/common';

import { RolesService } from 'src/modules/role/roles.service';
import { RolesController } from 'src/modules/role/roles.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}
