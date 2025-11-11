/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Auth } from '@/modules/auth/decorator/auth.decorator';
import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SignInDto } from './dtos/signin.dto';
import { AuthType } from './enums/auth-type.enum';
import { AuthService } from './providers/auth.service';
import { SignInResponseDto } from './dtos/signin-response.dto';
import {
  setRefreshCookie,
  clearRefreshCookie,
  RT_COOKIE_NAME,
} from '@/helpers/cookies-options.helper';
import { type Request, type Response } from 'express';
import {} from '@nestjs/common';
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(AuthType.None)
  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    //set refresh token in http-only cookie
    setRefreshCookie(res, refreshToken);
    return new SignInResponseDto({ accessToken, user });
  }

  @Auth(AuthType.None)
  @Post('signup')
  async createNewUser(@Body() payload: CreateUserDto) {
    await this.authService.signUp(payload);
    return { msg: 'Signup successful' };
  }

  @Auth(AuthType.None)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { cookies: Record<string, string | undefined> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: string = req.cookies[RT_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken({ refreshToken });

    // rotate RT in HttpOnly cookie
    setRefreshCookie(res, newRefreshToken);

    return { accessToken };
  }
  @Post('signout')
  signOut(@Res({ passthrough: true }) res: Response) {
    //clear refresh token cookie
    clearRefreshCookie(res);
    return { msg: 'Signout successful' };
  }
}
