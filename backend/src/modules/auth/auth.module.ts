import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from '../users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { SignInProvider } from './providers/sign-in.provider';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '@/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '@/modules/auth/guard/access-token.guard';
import { MyAuthGuard } from '@/modules/auth/auth/auth.guard';
import { GoogleAuthenticationController } from './social/google-authentication.controller';
import { GoogleAuthenticationService } from './social/google-authentication.service';
import { AccessControlProvider } from './providers/access-control.provider';
import { RoleGuard } from './guard/role-based.guard';
import { EmailProvider } from './providers/email-provider.provider';
import { appConfig } from '@/config/app.config';
import { RedisModule } from '../redis/redis.module';
import { SessionsProvider } from './providers/sessions.provider';
@Module({
  controllers: [AuthController, GoogleAuthenticationController],
  providers: [
    AuthService,
    SignInProvider,
    { provide: HashingProvider, useClass: BcryptProvider },
    GenerateTokensProvider,
    RefreshTokensProvider,
    {
      provide: APP_GUARD,
      useClass: MyAuthGuard,
    },
    AccessTokenGuard,
    RoleGuard,
    GoogleAuthenticationService,
    AccessControlProvider,
    EmailProvider,
    SessionsProvider,
  ],
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    RedisModule,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
