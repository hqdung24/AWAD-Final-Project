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
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) //to resolve circular dependency
    private userService: UsersService,

    //inject sign-in provider
    private readonly signInProvider: SignInProvider,

    //inject refresh tokens provider
    private readonly refreshTokensProvider: RefreshTokensProvider,
  ) {}

  public async signUp(createUserDto: CreateUserDto) {
    const user = await this.userService.createNew(createUserDto);
    return user;
  }

  public async signIn(signInDto: SignInDto) {
    //return user and tokens
    return this.signInProvider.signIn(signInDto);
  }

  public async refreshToken({ refreshToken }: RefreshTokenDto) {
    //delegate to refresh tokens provider
    //inject refresh tokens provider

    const tokens = await this.refreshTokensProvider.refreshToken(refreshToken);
    if (!tokens) {
      throw new BadRequestException('Failed to refresh the token');
    }
    return tokens;
  }
}
