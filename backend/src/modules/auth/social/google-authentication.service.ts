import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { jwtConfig } from '../../../config/jwt.config';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { UsersService } from '@/modules/users/providers/users.service';
import { GenerateTokensProvider } from '../providers/generate-tokens.provider';
import { SessionsProvider } from '../providers/sessions.provider';
import { User } from '@/modules/users/entities/user.entity';
@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    //Inject jwt configuration
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @Inject(forwardRef(() => UsersService)) //to resolve circular dependency
    private readonly usersService: UsersService,

    //Inject token generation provider
    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly sessionsProvider: SessionsProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authenticate({ token }: GoogleTokenDto) {
    //verify the google token sent by user
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: token,
      audience: this.jwtConfiguration.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    //extract user data from the token
    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
    } = payload;

    if (!email || !firstName || !lastName) {
      throw new Error('Missing required user information from Google');
    }

    let user: User | null = null;

    //check if the user exists in our database using googleId
    user = await this.usersService.findOneByGoogleId(googleId);

    //check if user with the email exists in our database but without googleId
    const existingUser = await this.usersService
      .findOneByEmail(email)
      .catch(() => null); //ignore error if user not found

    if (existingUser && !existingUser.googleId) {
      //link googleId to existing user
      existingUser.googleId = googleId;
      existingUser.isVerified = true; //mark user as verified since google account is verified
      existingUser.verificationToken = null; //clear any existing verification token if user was unverified but logged in with google
      //update user record
      await this.usersService.updateUser(existingUser.id, existingUser);
      user = existingUser;
    }

    //if user does not exist, create a new user
    if (!user) {
      user = await this.usersService.createGoogleUser({
        email,
        firstName,
        lastName,
        googleId,
      });
    }

    const { accessToken } =
      await this.generateTokensProvider.generateTokens(user);

    //session creation with refresh token
    const refreshToken = this.generateTokensProvider.generateRandomToken();
    const { sessionId } = await this.sessionsProvider.createSession({
      userId: user.id,
      refreshToken,
      device: 'Unknown',
    });

    // Attach sessionId to refreshToken for client use
    const refreshTokenWithSession = `${refreshToken}|${sessionId}`;
    return {
      accessToken,
      refreshToken: refreshTokenWithSession,
      user,
    };
    //generate access and refresh tokens for the user
    //return the tokens
  }
}
