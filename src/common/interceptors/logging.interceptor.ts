import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  private safeStringify(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    const user = (request as any).user;
    const userInfo = user ? `${user.username} (ID: ${user.id})` : 'anonymous';

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.log(
      `\x1b[36m[START]\x1b[0m ${method} ${url} - ${controllerName}.${handlerName} - ${userInfo} - ${ip}`
    );

    // this.logger.debug(
    //   `\x1b[34m[REQ]\x1b[0m UA: ${userAgent}, Type: ${
    //     headers['content-type'] || 'none'
    //   }, Length: ${headers['content-length'] || 'unknown'}`
    // );

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        let size = 0;
        if (data) {
          try {
            size =
              typeof data === 'string'
                ? data.length
                : this.safeStringify(data).length;
          } catch (error) {
            size = 0;
            this.logger.debug(
              `Failed to calculate response size: ${error.message}`
            );
          }
        }

        this.logger.log(
          `\x1b[32m[OK]\x1b[0m ${method} ${url} - ${statusCode} - ${duration}ms - ${userInfo}`
        );

        // this.logger.debug(
        //   `\x1b[35m[PERF]\x1b[0m ${duration}ms | Size: ${size} bytes | Heap: ${(
        //     process.memoryUsage().heapUsed /
        //     1024 /
        //     1024
        //   ).toFixed(2)}MB`
        // );

        if (duration > 1000) {
          const level = duration > 5000 ? '\x1b[31m[SLOW]' : '\x1b[33m[SLOW]';
          this.logger.warn(`${level}\x1b[0m ${method} ${url} - ${duration}ms`);
        }

        if (size > 1024 * 1024) {
          this.logger.warn(
            `\x1b[33m[LARGE]\x1b[0m ${method} ${url} - ${(
              size /
              1024 /
              1024
            ).toFixed(2)}MB`
          );
        }

        if (process.env.NODE_ENV === 'development' && size < 1000 && data) {
          try {
            const responsePreview = this.safeStringify(data).substring(0, 500);
            this.logger.debug(
              `\x1b[34m[RESP]\x1b[0m ${responsePreview}${
                size > 500 ? '...' : ''
              }`
            );
          } catch (error) {
            this.logger.debug(
              `\x1b[34m[RESP]\x1b[0m [Unable to serialize response]`
            );
          }
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        // Get status code safely - don't rely on response.statusCode if headers are already sent
        const statusCode = response.headersSent
          ? error.status || error.statusCode || 500
          : response.statusCode || 500;

        this.logger.error(
          `\x1b[31m[ERR]\x1b[0m ${method} ${url} - ${statusCode} - ${duration}ms - ${userInfo} - ${error.message}`
        );

        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(
            `\x1b[31m[STACK]\x1b[0m ${
              error.stack || 'No stack trace available'
            }`
          );
        }

        if ([401, 403].includes(statusCode)) {
          this.logger.warn(
            `\x1b[33m[AUTH]\x1b[0m ${statusCode} - ${method} ${url} - ${userInfo} - ${ip}`
          );
        }

        if (statusCode === 429) {
          this.logger.warn(
            `\x1b[33m[RATE]\x1b[0m ${method} ${url} - ${userInfo} - ${ip}`
          );
        }

        return throwError(() => error);
      })
    );
  }
}
