/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsGlobalExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();

    let errorPayload: {
      type: string;
      message: string;
    } = {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };

    // Business / explicit WebSocket errors
    if (exception instanceof WsException) {
      errorPayload = {
        type: 'WS_EXCEPTION',
        message: exception.message,
      };
    }

    // Validation errors (ValidationPipe -> BadRequestException)
    else if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      let message = 'Validation failed';

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const responseMessage = (response as any).message;
        message = Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage;
      }

      errorPayload = {
        type: 'VALIDATION_ERROR',
        message,
      };
    }

    // Emit error to the current socket only
    client.emit('error', errorPayload);
  }
}
