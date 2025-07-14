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
    const { method, url, ip, body, headers } = request;
    const startTime = Date.now();

    const user = (request as any).user;
    const userInfo = user ? `${user.username} (ID: ${user.id})` : '';

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

        // Prepare body info for POST/PATCH/PUT (limited)
        let bodyInfo = '';
        if (
          ['POST', 'PATCH', 'PUT'].includes(method) &&
          body &&
          Object.keys(body).length > 0
        ) {
          try {
            const maxBodyLength = 500;
            const bodyPreview = this.safeStringify(body).substring(
              0,
              maxBodyLength
            );
            bodyInfo = ` | Body: ${bodyPreview}${
              this.safeStringify(body).length > maxBodyLength ? '...' : ''
            }`;
          } catch (error) {
            bodyInfo = ' | Body: [Unable to serialize]';
          }
        }

        // Prepare response info (always log, limited)
        let respInfo = '';
        if (size < 1000 && data) {
          try {
            const maxRespLength = 50;
            const responsePreview = this.safeStringify(data).substring(
              0,
              maxRespLength
            );
            respInfo = ` | Resp: ${responsePreview}${
              this.safeStringify(data).length > maxRespLength ? '...' : ''
            }`;
          } catch (error) {
            respInfo = ' | Resp: [Unable to serialize]';
          }
        }

        if (url !== '/auth/profile')
          this.logger.log(
            `\x1b[32m[OK]\x1b[0m ${method} ${url} - ${statusCode} - ${duration}ms - ${userInfo}${bodyInfo}${respInfo}`
          );

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
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Get the correct status code from the error
        let statusCode = 500;
        if (error.status) {
          statusCode = error.status;
        } else if (error.statusCode) {
          statusCode = error.statusCode;
        } else if (error.getStatus) {
          statusCode = error.getStatus();
        } else if (response.headersSent) {
          statusCode = response.statusCode;
        }

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
