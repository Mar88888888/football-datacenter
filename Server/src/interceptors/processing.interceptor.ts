import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { DataStatus, DataStatusType, Defaults } from '../common/constants';

interface DataResult<T> {
  data: T | null;
  status: DataStatusType;
  retryAfter?: number;
}

/**
 * Interceptor that automatically handles 202 (processing) responses.
 * When a service returns { status: 'processing', retryAfter }, this interceptor
 * sets the appropriate HTTP status and headers.
 */
@Injectable()
export class ProcessingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result: DataResult<any>) => {
        if (!result || typeof result !== 'object' || !('status' in result)) {
          return result;
        }

        const response = context.switchToHttp().getResponse<Response>();

        if (result.status === DataStatus.PROCESSING) {
          response.setHeader('Retry-After', String(result.retryAfter ?? Defaults.RETRY_AFTER_SECONDS));
          response.status(HttpStatus.ACCEPTED);
          return { status: DataStatus.PROCESSING };
        }

        if (result.status === DataStatus.NOT_AVAILABLE) {
          response.status(HttpStatus.NO_CONTENT);
          return null;
        }

        return result.data;
      }),
    );
  }
}
