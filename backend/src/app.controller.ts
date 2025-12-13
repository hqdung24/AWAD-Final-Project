import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from './modules/auth/enums/auth-type.enum';
@ApiTags('Health')
@Controller()
@Auth(AuthType.None)
export class AppController {
  @Get()
  welcome() {
    return { message: 'Server is running' };
  }
}
