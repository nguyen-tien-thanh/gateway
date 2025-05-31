import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService]
})
export class RefreshTokenModule {}
