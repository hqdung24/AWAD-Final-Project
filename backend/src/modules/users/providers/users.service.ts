import { AuthService } from '@/modules/auth/providers/auth.service';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { profileConfig } from '../config/profile.config';
import { CreateUserDto } from '../dtos/create-user.dto';
import { GetUsersParamsDto } from '../dtos/get-user-params.dto';
import { GoogleUser } from '../interfaces/googleUser';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { CreateUsersProvider } from './create-users.provider';
import { FindOneUserProvider } from './find-one-user.provider';
import { FindManyUsersProvider } from './find-many-users.provider';
import { UpdateUserProvider } from './update-user.provider';
import { User } from '../user.entity';

@Injectable()
export class UsersService {
  constructor(
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

    //Inject create google user provider
    private readonly createGoogleUserProvider: CreateGoogleUserProvider,

    //Inject find many users provider
    private readonly findManyUsersProvider: FindManyUsersProvider,

    //Inject update user provider
    private readonly updateUserProvider: UpdateUserProvider,
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
  async findOneById(id: string) {
    const user = await this.findOneUserProvider.findOneById(id);
    if (!user) {
      throw new BadRequestException('User not found with the provided ID');
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.findOneUserProvider.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found with the provided email');
    }
    return user;
  }

  async findOneByGoogleId(googleId: string) {
    const user = await this.findOneUserProvider.findOneByGoogleId(googleId);
    if (!user) {
      throw new BadRequestException(
        'User not found with the provided Google ID',
      );
    }
    return user;
  }

  async findOneByUsername(username: string) {
    const user = await this.findOneUserProvider.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException(
        'User not found with the provided username',
      );
    }
    return user;
  }

  async findManyByIds(userIds: string[]) {
    const users = await this.findManyUsersProvider.findManyByIds(userIds);
    if (!users || users.length === 0) {
      throw new BadRequestException('No users found for the provided IDs');
    }
    return users;
  }

  async createNew(userData: CreateUserDto) {
    const result = await this.createUsersProvider.createUser(userData);
    if (!result) {
      throw new BadRequestException('Failed to create user, please try again');
    }
    return result;
  }

  async createGoogleUser(googleUserData: GoogleUser) {
    return await this.createGoogleUserProvider.createGoogleUser(googleUserData);
  }

  async updateUser(id: string, updateData: Partial<User>) {
    const result = await this.updateUserProvider.updateUser(id, updateData);

    if (result.affected && result.affected > 0) {
      const updatedUser = await this.findOneById(id);
      return updatedUser;
    } else {
      throw new BadRequestException('Failed to update user');
    }
  }
}
