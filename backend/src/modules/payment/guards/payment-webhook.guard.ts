import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { payosConfig } from '@/config/payment.config';
import { type Webhook } from '@payos/node';
import { sortObjDataByKey, convertObjToQueryStr } from '../utils/payos.util';
@Injectable()
export class PaymentWebhookGuard implements CanActivate {
  constructor(
    @Inject(payosConfig.KEY)
    private readonly payosConfiguration: ConfigType<typeof payosConfig>,
  ) {}

  isValidData(
    data: Record<string, unknown>,
    currentSignature: string,
    checksumKey: string,
  ) {
    const sortedDataByKey = sortObjDataByKey(data);
    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac('sha256', checksumKey)
      .update(dataQueryStr)
      .digest('hex');
    return dataToSignature == currentSignature;
  }
  // Guard to verify webhook signature, or use service method to verify manually
  canActivate(context: ExecutionContext): boolean {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const CHECKSUM_KEY =
        this.payosConfiguration.checksumKey || 'default_checksum_key';

      const body = req.body as unknown as Webhook;

      const isValidPayload = this.isValidData(
        body.data as unknown as Record<string, unknown>,
        body.signature,
        CHECKSUM_KEY,
      );
      console.log({ CHECKSUM_KEY, isValidPayload, body });
      if (!isValidPayload) {
        throw new UnauthorizedException('Invalid payload');
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid payload');
    }
  }
}
