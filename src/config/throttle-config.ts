import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

const throttleConfig: ThrottlerModuleOptions = {
  ttl: Number(process.env.THROTTLE_TTL) || 60,
  limit: Number(process.env.THROTTLE_LIMIT) || 60,
  storage: new ThrottlerStorageRedisService({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  })
};

export = throttleConfig;
