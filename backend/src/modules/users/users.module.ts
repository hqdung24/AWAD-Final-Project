import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { profileConfig } from './config/profile.config';
import { User } from './entities/user.entity';
import { UsersRepository } from './providers/users.repository';
import { UsersService } from './providers/users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(profileConfig),
  ],
})
export class UsersModule {}
