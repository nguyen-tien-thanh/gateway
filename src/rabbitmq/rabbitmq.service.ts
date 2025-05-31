import {
  Injectable,
  Logger,
  RequestTimeoutException,
  OnModuleInit,
  OnModuleDestroy
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport
} from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface GatewayRequest {
  service: string;
  operation: string;
  data?: any;
  correlationId?: string;
  timestamp?: Date;
  source?: string;
}

export interface GatewayResponse {
  success: boolean;
  data?: any;
  error?: string;
  correlationId: string;
  processingTime: number;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private client: ClientProxy;

  private readonly config = {
    timeout: Number(process.env.RABBITMQ_TIMEOUT) || 30000,
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'gateway_requests',
    source: process.env.APP_NAME || 'gateway'
  };

  constructor() {
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

  private enrichRequest(request: GatewayRequest): GatewayRequest {
    return {
      ...request,
      correlationId: request.correlationId || uuidv4(),
      timestamp: new Date(),
      source: this.config.source
    };
  }

  private getPattern(service: string, operation: string): string {
    return `${service}.${operation}`;
  }

  async sendRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const enriched = this.enrichRequest(request);
    const pattern = this.getPattern(request.service, request.operation);
    const startTime = Date.now();

    try {
      this.logger.log(
        `Sending request to ${pattern} [${enriched.correlationId}]`
      );

      const response = await firstValueFrom(
        this.client.send(pattern, enriched).pipe(timeout(this.config.timeout))
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Response from ${pattern} [${enriched.correlationId}] in ${processingTime}ms`
      );

      return {
        success: true,
        data: response,
        correlationId: enriched.correlationId,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Request failed ${pattern} [${enriched.correlationId}] after ${processingTime}ms`,
        error
      );

      if (error.name === 'TimeoutError') {
        throw new RequestTimeoutException(`Request timeout for ${pattern}`);
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
        correlationId: enriched.correlationId,
        processingTime
      };
    }
  }

  async sendEvent(request: GatewayRequest): Promise<void> {
    const enriched = this.enrichRequest(request);
    const pattern = this.getPattern(request.service, request.operation);

    try {
      this.logger.log(
        `Sending event to ${pattern} [${enriched.correlationId}]`
      );
      this.client.emit(pattern, enriched);
      this.logger.log(`Event sent to ${pattern} [${enriched.correlationId}]`);
    } catch (error) {
      this.logger.error(
        `Failed to send event to ${pattern} [${enriched.correlationId}]`,
        error
      );
      throw error;
    }
  }

  async healthCheck(service: string): Promise<GatewayResponse> {
    return this.sendRequest({ service, operation: 'health' });
  }
}
