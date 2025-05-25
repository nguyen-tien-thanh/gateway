import { forwardRef, Module } from '@nestjs/common';

import { RolesService } from 'src/role/roles.service';
import { RolesController } from 'src/role/roles.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}
