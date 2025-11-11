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
    const { email, password } = signInDto;

    //Find user by email first
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('Email is not registered');
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
    return { accessToken, refreshToken };
  }
}
