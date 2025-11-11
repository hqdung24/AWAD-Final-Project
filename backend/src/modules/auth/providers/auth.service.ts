import { UsersService } from '@/modules/users/providers/users.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
    console.log('sign in dto', signInDto);
    const tokens = await this.signInProvider.signIn(signInDto);
    const user = await this.userService.findOneByEmail(signInDto.email);

    //return user and tokens
    return { user, ...tokens };
  }

  public async refreshToken({ refreshToken }: RefreshTokenDto) {
    //delegate to refresh tokens provider
    //inject refresh tokens provider

    const tokens = await this.refreshTokensProvider.refreshToken(refreshToken);
    return tokens;
  }
}
