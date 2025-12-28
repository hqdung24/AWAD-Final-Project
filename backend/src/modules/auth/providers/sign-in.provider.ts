import { UsersService } from '@/modules/users/providers/users.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { HashingProvider } from './hashing.provider';
import { User } from '@/modules/users/entities/user.entity';
import { SessionsProvider } from './sessions.provider';
@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    //inject hashing provider
    private readonly hashingProvider: HashingProvider,

    //inject generate tokens provider
    private readonly generateTokensProvider: GenerateTokensProvider,

    //inject sessions provider
    private readonly sessionsProvider: SessionsProvider,
  ) {}
  public async signIn(signInDto: SignInDto) {
    const { emailOrUsername: identifier, password } = signInDto;

    if (!identifier || !password) {
      throw new BadRequestException('Email/Username and password are required');
    }
    //Find user by email or username
    let user: User;
    if (identifier.includes('@')) {
      user = await this.userService.findOneByEmail(identifier);
    } else {
      user = await this.userService.findOneByUsername(identifier);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'User does not have a password set. Please use social login.',
      );
    }

    if (!user.isVerified) {
      throw new BadRequestException('Email is not verified');
    }

    // Validate password
    const isPasswordValid = await this.hashingProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    //Session creation
    const refreshToken = this.generateTokensProvider.generateRandomToken();
    const { sessionId } = await this.sessionsProvider.createSession({
      userId: user.id,
      refreshToken,
      device: 'Unknown',
    });

    // Attach sessionId to refreshToken for client use
    const refreshTokenWithSession = `${refreshToken}|${sessionId}`;

    //Token generation
    const { accessToken } =
      await this.generateTokensProvider.generateTokens(user);
    return { user, accessToken, refreshToken: refreshTokenWithSession };
  }
}
