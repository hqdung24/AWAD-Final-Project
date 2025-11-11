import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';
@Injectable()
export class BcryptProvider implements HashingProvider {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data.toString(), salt);
  }
  async compare(data: string | Buffer, hashedData: string): Promise<boolean> {
    return await bcrypt.compare(data.toString(), hashedData);
  }
}
