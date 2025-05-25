import { forwardRef, Module } from '@nestjs/common';

import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService, RefreshTokenRepository],
  controllers: []
})
export class RefreshTokenModule {}
