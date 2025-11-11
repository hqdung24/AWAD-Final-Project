import { AuthService } from '@/modules/auth/providers/auth.service';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { profileConfig } from '../config/profile.config';
import { CreateUserDto } from '../dtos/create-user.dto';
import { GetUsersParamsDto } from '../dtos/get-user-params.dto';
import { User } from '../user.entity';
import { CreateUsersProvider } from './create-users.provider';
import { FindOneUserProvider } from './find-one-user.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // Inject profile config service
    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,
    // Inject AuthService (example of forwardRef)
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    //Inject create user provider
    private readonly createUsersProvider: CreateUsersProvider,

    //Inject find one user provider
    private readonly findOneUserProvider: FindOneUserProvider,
  ) {}
  findAll(getUserParamsDto: GetUsersParamsDto, limit: number, page: number) {
    console.log('users params dto', getUserParamsDto, limit, page);
    throw new HttpException(
      {
        error: 'Method has been moved.',
        status: HttpStatus.MOVED_PERMANENTLY,
        fileName: 'users.service.ts',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        cause: new Error(
          'Use UsersService.findAllUsersWithPagination instead.',
        ),
        description: 'This method has been deprecated.',
      },
    );
  }
  async findById(id: string) {
    const user = await this.findOneUserProvider.findOneById(id);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.findOneUserProvider.findOneByEmail(email);
    return user;
  }

  async createNew(userData: CreateUserDto) {
    return await this.createUsersProvider.createUser(userData);
  }
}
