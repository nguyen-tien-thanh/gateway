import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import * as path from 'path';
import {
  CookieResolver,
  HeaderResolver,
  I18nJsonParser,
  I18nModule,
  QueryResolver
} from 'nestjs-i18n';

import { AuthModule } from 'src/modules/auth/auth.module';
import { RolesModule } from 'src/modules/role/roles.module';
import { PermissionsModule } from 'src/modules/permission/permissions.module';
import * as throttleConfig from 'src/config/throttle-config';
// import { MailModule } from 'src/modules/mail/mail.module';
import { EmailTemplateModule } from 'src/modules/email-template/email-template.module';
import { RefreshTokenModule } from 'src/modules/refresh-token/refresh-token.module';
import { TwofaModule } from 'src/modules/twofa/twofa.module';
import { CustomThrottlerGuard } from 'src/common/guard/custom-throttle.guard';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { AppController } from 'src/app.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
import { I18nExceptionFilterPipe } from './common/pipes/i18n-exception-filter.pipe';
import { RabbitMQModule } from './shared/rabbitmq/rabbitmq.module';
import { HouseModule } from './modules/house/house.module';
import { RoomModule } from './modules/room/room.module';
import { TenantContractModule } from './modules/tenant-contract/tenant-contract.module';
import { AssetModule } from './modules/asset/asset.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { AssetCategoryModule } from './modules/asset-category/asset-category.module';
import { ImageModule } from './modules/image/image.module';
import { RoomAssetModule } from './modules/room-asset/room-asset.module';
import { QRCodeModule } from './modules/qr-code/qr-code.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    PrismaModule,
    RabbitMQModule,
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'vi',
        parserOptions: {
          path: path.join(__dirname, '../i18n/'),
          watch: true
        }
      }),
      parser: I18nJsonParser,
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang', 'locale', 'l']
        },
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(['lang', 'locale', 'l'])
      ]
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    // MailModule,
    EmailTemplateModule,
    RefreshTokenModule,
    TwofaModule,
    DashboardModule,
    HouseModule,
    RoomModule,
    TenantContractModule,
    MaintenanceModule,
    AssetModule,
    AssetCategoryModule,
    ImageModule,
    QRCodeModule,
    RoomAssetModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilterPipe
    }
  ],
  controllers: [AppController]
})
export class AppModule {}
