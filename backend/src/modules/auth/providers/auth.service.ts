import { UsersService } from '@/modules/users/providers/users.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { RefreshTokenDto } from '@/modules/auth/dtos/refresh-token.dto';
import { CreateUserDto } from '@/modules/users/dtos/create-user.dto';
import { EMAIL_TEMPLATES } from '../constant/email.constant';
import { EmailProvider } from './email-provider.provider';
import { SessionsProvider } from './sessions.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) //to resolve circular dependency
    private userService: UsersService,

    //inject sign-in provider
    private readonly signInProvider: SignInProvider,

    //inject refresh tokens provider
    private readonly refreshTokensProvider: RefreshTokensProvider,

    //inject email provider
    private readonly emailProvider: EmailProvider,

    //inject sessions provider
    private readonly sessionsProvider: SessionsProvider,
  ) {}
  private async generateVerificationToken(email: string): Promise<string> {
    //generate a random token (you can use any method you prefer)
    const token = Math.random().toString(36).substring(2, 15);
    //find user by email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    //update user with the verification token
    await this.userService.updateUser(user.id, {
      verificationToken: token,
    });
    return token;
  }

  private async verifyVerificationToken(
    email: string,
    verificationToken: string,
  ) {
    //find user and update verification token
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    //check if user is already verified AND no token exists
    if (user.isVerified && !user.verificationToken) {
      throw new BadRequestException(
        'User is already verified or no token found',
      );
    }

    //check if token matches
    if (user.verificationToken !== verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }
    return user;
  }

  public async signUp(createUserDto: CreateUserDto) {
    const user = await this.userService.createNew(createUserDto);
    await this.sendVerificationEmail(user.email);
    return user;
  }

  public async signIn(signInDto: SignInDto) {
    //return user and tokens
    return this.signInProvider.signIn(signInDto);
  }

  public async refreshToken({ refreshToken }: RefreshTokenDto) {
    const tokens = await this.refreshTokensProvider.refreshToken(refreshToken);
    if (!tokens) {
      throw new BadRequestException('Failed to refresh the token');
    }
    return tokens;
  }

  public async signOut(refreshToken: string) {
    try {
      // Parse refreshToken format: "randomToken|sessionId"
      const [, sessionId] = refreshToken.split('|');

      if (sessionId) {
        await this.sessionsProvider.destroySession(sessionId);
      }
    } catch {
      // Silent fail - session might already be expired
    }
  }

  public async sendPasswordResetEmail(email: string) {
    //find user by email
    const user = await this.userService.findOneByEmail(email).catch(() => null);

    if (!user || !user.isVerified) {
      //if user not found or not verified, ensure not overwrite existing token
      //still return success message to prevent email enumeration
      return;
    }
    const resetToken = await this.generateVerificationToken(email);
    const { email: toAddress, username, firstName, lastName } = user;
    const toName = username || `${firstName} ${lastName}`; //fallback to full name if username not available
    return this.emailProvider.sendEmail(
      toAddress,
      toName,
      EMAIL_TEMPLATES.PASSWORD_RESET,
      resetToken,
    );
  }

  public async updatePassword(
    email: string,
    newPassword: string,
    verificationToken: string,
  ) {
    //find user and update password
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    //verify the token
    await this.verifyVerificationToken(email, verificationToken);

    //after password updated, the token should be null
    const newUser = await this.userService.updateUser(user.id, {
      password: newPassword,
      verificationToken: null,
    });
    return newUser;
  }

  public async sendVerificationEmail(email: string) {
    //find user by email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const verificationToken = await this.generateVerificationToken(email);
    const { email: toAddress, username, firstName, lastName } = user;
    const toName = username || `${firstName} ${lastName}`; //fallback to full name if username not available
    return this.emailProvider.sendEmail(
      toAddress,
      toName,
      EMAIL_TEMPLATES.VERIFICATION,
      verificationToken,
    );
  }

  //verify user email
  public async verifyUser(email: string, token: string) {
    const user = this.verifyVerificationToken(email, token);

    //update user as verified and remove verification token
    const verifiedUser = await this.userService.updateUser((await user).id, {
      isVerified: true,
      verificationToken: null,
    });
    return verifiedUser;
  }
}
