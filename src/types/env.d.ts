// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // Node Env
    NODE_ENV?: 'development' | 'production';

    // Server
    SERVER_PORT: string;

    // Database
    DATABASE_URL: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE_NAME: string;
    DB_PORT: string;

    // Redis
    REDIS_PORT: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;

    // Mail
    MAIL_HOST: string;
    MAIL_PORT: string;
    MAIL_USER: string;
    MAIL_PASS: string;
    MAIL_FROM: string;

    // AWS
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;

    // App
    APP_URL: string;
    FRONTEND_URL: string;
  }
}
