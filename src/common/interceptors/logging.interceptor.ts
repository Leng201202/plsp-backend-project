import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body, query, params } = request;
    const now = Date.now();
    this.logger.log(`Incoming Request: ${method} ${originalUrl} `);
    // this.logger.debug({
    //   body,
    //   query,
    //   params,
    // });
    return next.handle().pipe(
      tap((data) => {
        this.logger.log(
          `Outgoing Response: ${method} ${originalUrl} - ${Date.now() - now}ms`,
        );
        // this.logger.log({
        //   response:data,
        // });
      }),
    );
  }
}
