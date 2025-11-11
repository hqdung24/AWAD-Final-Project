/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
} from 'typeorm';

/**
 * Maps low-level TypeORM/driver errors to meaningful HttpExceptions.
 * Keep it lean: detect, convert, and rethrow. The filter will format the payload.
 */
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // If it's already an HttpException, pass it through (filter will format)
        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        // --- TypeORM entity not found ---
        if (err instanceof EntityNotFoundError) {
          return throwError(
            () =>
              new NotFoundException({
                code: 'ENTITY_NOT_FOUND',
                message: 'Resource not found',
              }),
          );
        }

        // --- TypeORM cannot create ID map (usually bad input) ---
        if (err instanceof CannotCreateEntityIdMapError) {
          return throwError(
            () =>
              new BadRequestException({
                code: 'INVALID_ID_MAP',
                message: 'Invalid identifier map or primary key.',
              }),
          );
        }

        // --- Query/constraint errors from TypeORM/driver ---
        if (
          err instanceof QueryFailedError ||
          err?.name === 'QueryFailedError'
        ) {
          // Common cross-DB hints
          const pgCode = err?.code; // e.g. Postgres: '23505', '23503', '23502'
          const myErrno = err?.errno; // e.g. MySQL: 1062 duplicate entry
          const sqliteCode = err?.code; // e.g. 'SQLITE_CONSTRAINT'
          const detail = err?.detail || err?.message;

          // Postgres
          if (pgCode === '23505') {
            return throwError(
              () =>
                new ConflictException({
                  code: 'UNIQUE_VIOLATION',
                  message: 'Duplicate value violates unique constraint.',
                  detail,
                }),
            );
          }
          if (pgCode === '23503') {
            return throwError(
              () =>
                new BadRequestException({
                  code: 'FOREIGN_KEY_VIOLATION',
                  message: 'Foreign key constraint fails.',
                  detail,
                }),
            );
          }
          if (pgCode === '23502') {
            return throwError(
              () =>
                new BadRequestException({
                  code: 'NOT_NULL_VIOLATION',
                  message: 'A required field is missing.',
                  detail,
                }),
            );
          }

          // MySQL / MariaDB
          if (myErrno === 1062) {
            return throwError(
              () =>
                new ConflictException({
                  code: 'UNIQUE_VIOLATION',
                  message: 'Duplicate value violates unique constraint.',
                  detail,
                }),
            );
          }
          // You can add more MySQL errno mappings here if you need.

          // SQLite
          if (sqliteCode === 'SQLITE_CONSTRAINT') {
            return throwError(
              () =>
                new BadRequestException({
                  code: 'CONSTRAINT_VIOLATION',
                  message: 'Constraint violation.',
                  detail,
                }),
            );
          }

          // Fallback for unmapped query failures
          return throwError(
            () =>
              new BadRequestException({
                code: 'QUERY_FAILED',
                message: 'Database query failed.',
                detail,
              }),
          );
        }

        // Generic fallback
        return throwError(
          () =>
            new InternalServerErrorException({
              code: 'INTERNAL_ERROR',
              message: 'Something went wrong.',
            }),
        );
      }),
    );
  }
}
