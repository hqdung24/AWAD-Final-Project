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
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dtos/update-admin-user.dto';
import { AdminUserQueryDto } from '../dtos/admin-user-query.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { HashingProvider } from '@/modules/auth/providers/hashing.provider';
import { MediaService } from '@/modules/media/media.service';
import { DEFAULT_AVATAR_URL } from '../constants/avatar.constant';
import { MediaType } from '@/modules/media/enums/media-type.enum';
import { MediaDomain } from '@/modules/media/enums/media-domain.enum';

@Injectable()
export class UsersService {
  constructor(
    // Inject profile config service
    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,
    // Inject AuthService (example of forwardRef)
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    // Repository with user DB operations
    private readonly usersRepository: UsersRepository,

    // Password hashing provider
    private readonly hashingProvider: HashingProvider,

    private readonly mediaService: MediaService,
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
    const user = await this.usersRepository.findOneById(id);
    if (!user) {
      throw new BadRequestException('User not found with the provided ID');
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found with the provided email');
    }
    return user;
  }

  async findOneByGoogleId(googleId: string) {
    const user = await this.usersRepository.findOneByGoogleId(googleId);
    return user;
  }

  async findOneByUsername(username: string) {
    const user = await this.usersRepository.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException(
        'User not found with the provided username',
      );
    }
    return user;
  }

  async findManyByIds(userIds: string[]) {
    const users = await this.usersRepository.findManyByIds(userIds);
    if (!users || users.length === 0) {
      throw new BadRequestException('No users found for the provided IDs');
    }
    return users;
  }

  async createNew(userData: CreateUserDto) {
    const result = await this.usersRepository.createUser(userData);
    if (!result) {
      throw new BadRequestException('Failed to create user, please try again');
    }

    //create media for default avatar if user is created successfully
    await this.mediaService.createMedia({
      domainId: result.id,
      url: DEFAULT_AVATAR_URL,
      type: MediaType.AVATAR,
      domain: MediaDomain.USER,
    });

    return result;
  }

  async createGoogleUser(googleUserData: GoogleUser) {
    const result = await this.usersRepository.createGoogleUser(googleUserData);

    if (!result) {
      throw new BadRequestException(
        'Failed to create Google user, please try again',
      );
    }
    //create media for default avatar if user is created successfully
    await this.mediaService.createMedia({
      domainId: result.id,
      url: DEFAULT_AVATAR_URL,
      type: MediaType.AVATAR,
      domain: MediaDomain.USER,
    });
    return result;
  }

  async updateUser(id: string, updateData: Partial<User>) {
    const result = await this.usersRepository.updateUser(id, updateData);

    if (result.affected && result.affected > 0) {
      const updatedUser = await this.findOneById(id);
      return updatedUser;
    } else {
      throw new BadRequestException('Failed to update user');
    }
  }

  async updateProfile(id: string, payload: UpdateProfileDto) {
    const updateData: Partial<User> = {
      ...payload,
      email: payload.email ? payload.email.trim().toLowerCase() : undefined,
    };

    const result = await this.usersRepository.updateUser(id, updateData);
    if (result.affected && result.affected > 0) {
      return await this.findOneById(id);
    }
    throw new BadRequestException('Failed to update profile');
  }

  async changePassword(id: string, payload: ChangePasswordDto) {
    const user = await this.usersRepository.findOneByIdWithPassword(id);
    if (!user || !user.password) {
      throw new BadRequestException('User not found');
    }

    const matches = await this.hashingProvider.compare(
      payload.currentPassword,
      user.password,
    );
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const result = await this.usersRepository.updateUser(id, {
      password: payload.newPassword,
    });
    if (result.affected && result.affected > 0) {
      return true;
    }
    throw new BadRequestException('Failed to update password');
  }

  async listAdmins(query: AdminUserQueryDto) {
    const roles = [RoleType.ADMIN, RoleType.MODERATOR];
    const role = query.role;
    if (role && !roles.includes(role)) {
      throw new BadRequestException('Role must be ADMIN or MODERATOR');
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    return await this.usersRepository.findAdmins({
      roles: role ? [role] : roles,
      search: query.search?.trim() || undefined,
      isActive:
        typeof query.isActive === 'boolean' ? query.isActive : undefined,
      page,
      limit,
    });
  }

  async createAdmin(payload: CreateAdminUserDto) {
    const role = payload.role ?? RoleType.ADMIN;
    if (![RoleType.ADMIN, RoleType.MODERATOR].includes(role)) {
      throw new BadRequestException('Role must be ADMIN or MODERATOR');
    }

    return await this.usersRepository.createAdminUser({
      ...payload,
      role,
    });
  }

  async updateAdmin(id: string, payload: UpdateAdminUserDto) {
    const user = await this.findOneById(id);
    if (![RoleType.ADMIN, RoleType.MODERATOR].includes(user.role as RoleType)) {
      throw new BadRequestException('User is not an admin account');
    }

    if (
      payload.role &&
      ![RoleType.ADMIN, RoleType.MODERATOR].includes(payload.role)
    ) {
      throw new BadRequestException('Role must be ADMIN or MODERATOR');
    }

    const updateData: Partial<User> = {
      ...payload,
      email: payload.email ? payload.email.trim().toLowerCase() : undefined,
    };

    const result = await this.usersRepository.updateUser(id, updateData);
    if (result.affected && result.affected > 0) {
      return await this.findOneById(id);
    }
    throw new BadRequestException('Failed to update admin');
  }

  async deactivateAdmin(id: string) {
    const user = await this.findOneById(id);
    if (![RoleType.ADMIN, RoleType.MODERATOR].includes(user.role as RoleType)) {
      throw new BadRequestException('User is not an admin account');
    }

    const result = await this.usersRepository.updateUser(id, {
      isActive: false,
    });
    if (result.affected && result.affected > 0) {
      return await this.findOneById(id);
    }
    throw new BadRequestException('Failed to deactivate admin');
  }

  async setPassword(id: string, newPassword: string) {
    const result = await this.usersRepository.updateUser(id, {
      password: newPassword,
      isActive: true,
    });
    if (result.affected && result.affected > 0) {
      return true;
    }
    throw new BadRequestException('Failed to set password');
  }

  async confirmAvatarUpload(
    userId: string,
    confirmDto: {
      key: string;
      domain: MediaDomain;
      domainId: string;
      type: MediaType;
    },
  ) {
    // Confirm upload and create media record
    const media = await this.mediaService.confirmUpload(confirmDto);

    // Bind avatar to user
    const result = await this.usersRepository.updateUser(userId, {
      avatarUrl: media.url,
    });

    if (result.affected && result.affected > 0) {
      return media;
    }
    throw new BadRequestException('Failed to update user avatar');
  }
}
