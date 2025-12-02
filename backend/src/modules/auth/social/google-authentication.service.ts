import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { jwtConfig } from '../../../config/jwt.config';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { UsersService } from '@/modules/users/providers/users.service';
import { GenerateTokensProvider } from '../providers/generate-tokens.provider';
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

    //check if the user exists in our database using googleId
    const user = await this.usersService.findOneByGoogleId(googleId);
    if (user) {
      const { accessToken, refreshToken } =
        await this.generateTokensProvider.generateTokens(user);
      return { accessToken, refreshToken, user };
    }
    //if google user does not exist, create a new user record
    if (!email || !firstName || !lastName) {
      throw new Error('Missing required user information from Google');
    }

    const newUser = await this.usersService.createGoogleUser({
      email,
      firstName,
      lastName,
      googleId,
    });

    //check if user with the email exists in our database but without googleId, only check when the database already has users
    // const existingUser = await this.usersService.findOneByEmail(email);
    // if (existingUser && !existingUser.googleId) {
    //   //link googleId to existing user
    //   existingUser.googleId = googleId;
    //   //update user record
    //   await this.usersService.updateUser(existingUser.id, existingUser);
    //   const { accessToken, refreshToken } =
    //     await this.generateTokensProvider.generateTokens(existingUser);
    //   return { accessToken, refreshToken, user: existingUser };
    // }

    const { accessToken, refreshToken } =
      await this.generateTokensProvider.generateTokens(newUser);

    return { accessToken, refreshToken, user: newUser };
    //generate access and refresh tokens for the user
    //return the tokens
  }
}
