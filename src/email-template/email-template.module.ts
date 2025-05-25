import { forwardRef, Module } from '@nestjs/common';

import { EmailTemplateService } from 'src/email-template/email-template.service';
import { EmailTemplateController } from 'src/email-template/email-template.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService]
})
export class EmailTemplateModule {}
