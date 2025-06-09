import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';

async function bootstrap() {
  const port = process.env.PORT || 7777;
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true
    });
    const swaggerConfig = new DocumentBuilder()
      .setTitle(process.env.APP_NAME || 'SOTA')
      .setDescription(process.env.APP_DESCRIPTION || 'Official SOTA API')
      .setVersion(process.env.APP_VERSION || 'v0.1')
      .addBearerAuth()
      .build();
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: process.env.APP_DESCRIPTION || 'Official SOTA API'
    };
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, customOptions);
  } else {
    const whitelist = [process.env.FRONTEND_URL || 'http://localhost:3000'];
    app.enableCors({
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    });
  }
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.use(cookieParser());
  await app.listen(port);

  console.log('\n -------------------------------------------');
  console.log(` 🚀 ${process.env.NODE_ENV?.toUpperCase()} mode`);
  console.log(` 🌐 ${process.env.APP_URL || 'http://localhost:7777'}`);
  console.log(' -------------------------------------------\n');
}

bootstrap();
