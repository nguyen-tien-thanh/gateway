import {
  Injectable,
  Logger,
  RequestTimeoutException,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Optional,
  HttpException
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport
} from '@nestjs/microservices';
import { REQUEST } from '@nestjs/core';
import { firstValueFrom, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface RMQRequest {
  pattern: string;
  filter?: any;
  payload?: any;
  id?: number;
  correlationId?: string;
  timestamp?: Date;
  source?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RMQResponse {
  totalItems?: number;
  results?: any;
  error?: string;
  statusCode?: number;
  message?: string;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('RabbitMQ');
  private client: ClientProxy;

  private readonly config = {
    timeout: Number(process.env.RABBITMQ_TIMEOUT) || 30000,
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'gateway_requests',
    source: process.env.APP_NAME || 'gateway'
  };

  constructor(@Optional() @Inject(REQUEST) private readonly request?: any) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.config.url],
        queue: this.config.queue,
        queueOptions: { durable: true }
      }
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  private getCurrentUser():
    | { id: number; username: string; email: string }
    | undefined {
    try {
      if (this.request?.user) {
        const user = this.request.user;
        if (user.id && user.username && user.email) {
          return {
            id: user.id,
            username: user.username,
            email: user.email
          };
        }
      }
    } catch (error) {
      // Ignore errors when getting user context
    }
    return undefined;
  }

  private enrichRequest(
    request: RMQRequest,
    user?: { id: number; username: string; email: string }
  ): RMQRequest {
    const currentUser = user || request.user || this.getCurrentUser();

    return {
      ...request,
      correlationId: request.correlationId || uuidv4(),
      timestamp: new Date(),
      source: this.config.source,
      user: currentUser
    };
  }

  async sendRequest(
    request: RMQRequest,
    user?: { id: number; username: string; email: string }
  ): Promise<RMQResponse> {
    const enriched = this.enrichRequest(request, user);
    const startTime = Date.now();

    try {
      const userContext = enriched.user
        ? ` [User: ${enriched.user.username}(${enriched.user.id})]`
        : '';
      this.logger.log(
        `Sending request to ${enriched.pattern} [${enriched.correlationId}]${userContext}`
      );

      const response = await firstValueFrom(
        this.client
          .send(enriched.pattern, {
            filter: enriched.filter,
            id: enriched.id,
            payload: enriched.payload,
            user: enriched.user
          })
          .pipe(timeout(this.config.timeout))
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Response from ${enriched.pattern} [${enriched.correlationId}] in ${processingTime}ms${userContext}`
      );

      if (response.count !== undefined) {
        return {
          totalItems: response.count,
          results: response.data
        };
      }

      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const userContext = enriched.user
        ? ` [User: ${enriched.user.username}(${enriched.user.id})]`
        : '';
      this.logger.error(
        `Request failed ${enriched.pattern} [${enriched.correlationId}] after ${processingTime}ms${userContext}`,
        error
      );

      if (error.name === 'TimeoutError') {
        throw new RequestTimeoutException(
          `Request timeout for ${enriched.pattern}`
        );
      }

      throw new HttpException(
        error.response || 'internalError',
        error.status || 500
      );
    }
  }

  async sendEvent(
    request: RMQRequest,
    user?: { id: number; username: string; email: string }
  ): Promise<void> {
    const enriched = this.enrichRequest(request, user);

    try {
      const userContext = enriched.user
        ? ` [User: ${enriched.user.username}(${enriched.user.id})]`
        : '';
      this.logger.log(
        `Sending event to ${enriched.pattern} [${enriched.correlationId}]${userContext}`
      );
      this.client.emit(enriched.pattern, {
        filter: enriched.filter,
        id: enriched.id,
        payload: enriched.payload,
        user: enriched.user
      });
      this.logger.log(
        `Event sent to ${enriched.pattern} [${enriched.correlationId}]${userContext}`
      );
    } catch (error) {
      const userContext = enriched.user
        ? ` [User: ${enriched.user.username}(${enriched.user.id})]`
        : '';
      this.logger.error(
        `Failed to send event to ${enriched.pattern} [${enriched.correlationId}]${userContext}`,
        error
      );
      throw new HttpException(error.response, error.status);
    }
  }

  async healthCheck(
    pattern: string,
    user?: { id: number; username: string; email: string }
  ): Promise<RMQResponse> {
    return this.sendRequest({ pattern }, user);
  }
}
