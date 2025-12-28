/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  clearRefreshCookie,
  RT_COOKIE_NAME,
  setRefreshCookie,
} from '@/common/helpers/cookies-options.helper';
import { Auth } from '@/modules/auth/decorator/auth.decorator';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SignInResponseDto } from './dtos/signin-response.dto';
import { SignInDto } from './dtos/signin.dto';
import { AuthType } from './enums/auth-type.enum';
import { AuthService } from './providers/auth.service';
import { GoogleAuthenticationService } from './social/google-authentication.service';
import {
  VerifyTokenDto,
  VerifyTokenResetPasswordDto,
} from './dtos/verify-token.dto';
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    //Inject google authentication service
    private readonly googleAuthService: GoogleAuthenticationService,
  ) {}

  @Auth(AuthType.None)
  @Post('signin')
  @ApiOperation({ summary: 'Sign in to an existing user account' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: SignInResponseDto,
  })
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
  @Post('google-authentication')
  async googleAuthentication(
    @Body() body: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.googleAuthService.authenticate({ token: body.token });
    setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Auth(AuthType.None)
  @Post('signup')
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Endpoint to create a new user account',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
    schema: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
      example: { msg: 'Signup successful' },
    },
  })
  async createNewUser(@Body() payload: CreateUserDto) {
    await this.authService.signUp(payload);
    return { msg: 'Signup successful' };
  }

  @Auth(AuthType.None)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    description:
      'Endpoint to refresh access token, send refresh token in cookie',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLTEyMzQiLCJpYXQiOjE2ODgwODc2MDAsImV4cCI6MTY4ODA5MTIwMH0.XYZ',
      },
    },
  })
  @ApiCookieAuth('refreshToken')
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
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh token from cookie
    const refreshToken = req.cookies[RT_COOKIE_NAME] as string | undefined;

    if (refreshToken) {
      // Destroy session in Redis
      await this.authService.signOut(refreshToken);
    }

    // Clear refresh token cookie
    clearRefreshCookie(res);
    return { msg: 'Signout successful' };
  }

  @Auth(AuthType.None)
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
      example: { email: 'user@example.com' },
    },
  })
  async requestPasswordReset(@Body() body: { email: string }) {
    const { email } = body;
    await this.authService.sendPasswordResetEmail(email);
    return { msg: 'Password reset email sent if the email is registered' };
  }

  @Auth(AuthType.None)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: VerifyTokenResetPasswordDto })
  async resetPassword(@Body() body: VerifyTokenResetPasswordDto) {
    const { email, token, password: newPassword } = body;
    await this.authService.updatePassword(email, newPassword, token);
    return { msg: 'Password reset successful' };
  }

  @Auth(AuthType.None)
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiBody({
    type: VerifyTokenDto,
  })
  async verifyEmail(@Body() body: VerifyTokenDto) {
    const { email, token } = body;
    const verifiedUser = await this.authService.verifyUser(email, token);
    return { msg: 'Email verified successfully', user: verifiedUser };
  }
}
