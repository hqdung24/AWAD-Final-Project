import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from '@/modules/auth/providers/hashing.provider';
@Injectable()
export class CreateUsersProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}
  async createUser(userData: CreateUserDto) {
    // normalize email
    const email = userData.email.trim().toLowerCase();

    // check if user with email already exists
    const exists = await this.usersRepository.exists({ where: { email } });
    if (exists)
      throw new BadRequestException('User with this email already exists');

    // 3) Tạo entity + hash password
    const user = this.usersRepository.create({
      ...userData,
      email,
      password: await this.hashingProvider.hash(userData.password),
    });

    try {
      const saved = await this.usersRepository.save(user);

      const safeUser = await this.usersRepository.findOne({
        where: { id: saved.id },
      });

      return safeUser;
    } catch (e: unknown) {
      // 5) Chặn race condition trùng email ở tầng DB
      //   - Postgres: code 23505
      //   - MySQL/MariaDB: ER_DUP_ENTRY
      const errCode =
        typeof e === 'object' && e !== null && 'code' in e
          ? (e as { code?: unknown }).code
          : undefined;

      if (errCode === '23505' || errCode === 'ER_DUP_ENTRY') {
        throw new BadRequestException('User with this email already exists');
      }
      throw new InternalServerErrorException('Could not create user');
    }
  }
}
