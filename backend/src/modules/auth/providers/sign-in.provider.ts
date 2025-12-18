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
@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    //inject hashing provider
    private readonly hashingProvider: HashingProvider,

    //inject generate tokens provider
    private readonly generateTokensProvider: GenerateTokensProvider,
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

    // Further sign-in logic goes here (e.g., password verification, token generation, etc.)
    const isPasswordValid = await this.hashingProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } =
      await this.generateTokensProvider.generateTokens(user);
    return { user, accessToken, refreshToken };
  }
}
