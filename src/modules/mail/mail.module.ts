import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { MailService } from 'src/modules/mail/mail.service';
import { MailProcessor } from 'src/modules/mail/mail.processor';
import { EmailTemplateModule } from 'src/modules/email-template/email-template.module';

@Module({
  imports: [
    EmailTemplateModule,
    BullModule.registerQueueAsync({
      name: process.env.MAIL_QUEUE_NAME || 'agb-mail',
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || '',
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          }
        }
      })
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
          port: Number(process.env.MAIL_PORT) || 2525,
          secure: process.env.MAIL_SECURE === 'true',
          ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
          auth: {
            user: process.env.MAIL_USER || '',
            pass: process.env.MAIL_PASS || ''
          }
        },
        defaults: {
          from: `"${process.env.MAIL_FROM || 'agb'}" <${
            process.env.MAIL_FROM_MAIL || 'noreply@agb.com'
          }>`
        },
        preview: process.env.MAIL_PREVIEW === 'true',
        template: {
          dir: __dirname + '/templates/email/layouts/',
          adapter: new PugAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [MailService, MailProcessor],
  exports: [MailService]
})
export class MailModule {}
