/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // defaults
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException || (exception as any)?.getStatus) {
      status = (exception as HttpException).getStatus();

      const payload = (exception as HttpException).getResponse() as
        | string
        | { message?: unknown; error?: string; code?: string; details?: any };

      if (typeof payload === 'string') {
        message = payload;
        code = codeFromStatus(status);
      } else {
        code = payload?.code ?? codeFromStatus(status);
        message = pickMessage(payload?.message, payload?.error) ?? message;
        details = payload?.details;
      }
    } else {
      // Non-HttpException (should be rare because your interceptor normalizes)
      const anyErr = exception as any;
      message = anyErr?.message || message;
      code = 'INTERNAL_SERVER_ERROR';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    res.status(status).json({
      status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

/* ------------- helpers ------------- */

function codeFromStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

function pickMessage(message?: unknown, fallback?: string): string | undefined {
  if (typeof message === 'string') return message;
  if (
    Array.isArray(message) &&
    message.length > 0 &&
    typeof message[0] === 'string'
  ) {
    return message[0]; // keep it simple; details stay in interceptor if needed
  }
  return fallback;
}
