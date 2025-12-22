import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { GoogleUser } from '../interfaces/googleUser';
import { HashingProvider } from '@/modules/auth/providers/hashing.provider';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async createGoogleUser(googleUser: GoogleUser) {
    try {
      const newUser = this.usersRepository.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        googleId: googleUser.googleId,
        role: 'USER',
        isVerified: true,
        verificationToken: null,
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      throw new ConflictException(error, 'Error creating Google user');
    }
  }

  public async createUser(userData: CreateUserDto) {
    // normalize email
    const email = userData.email.trim().toLowerCase();

    // check if user with email already exists
    const exists = await this.usersRepository.exists({ where: { email } });
    if (exists)
      throw new BadRequestException('User with this email already exists');

    // create entity + hash password
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
      throw new InternalServerErrorException(e, 'Could not create user');
    }
  }

  public async createAdminUser(
    userData: CreateAdminUserDto & { role: RoleType; isActive?: boolean },
  ) {
    const email = userData.email.trim().toLowerCase();
    const exists = await this.usersRepository.exists({ where: { email } });
    if (exists)
      throw new BadRequestException('User with this email already exists');

    const user = this.usersRepository.create({
      ...userData,
      email,
      lastName: userData.lastName ?? '',
      role: userData.role,
      isVerified: true,
      verificationToken: null,
      isActive: userData.isActive ?? true,
      password: await this.hashingProvider.hash(userData.password),
    });

    try {
      const saved = await this.usersRepository.save(user);
      const safeUser = await this.usersRepository.findOne({
        where: { id: saved.id },
      });
      return safeUser;
    } catch (e: unknown) {
      throw new InternalServerErrorException(e, 'Could not create admin user');
    }
  }

  public async findManyByIds(userIds: string[]) {
    const users = await this.usersRepository.findBy({ id: In(userIds) });
    return users;
  }

  public async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  public async findOneByIdWithPassword(id: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    return user;
  }

  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  public async findOneByUsername(username: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  public async findOneByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { googleId } });
    return user;
  }

  public async updateUser(
    id: string,
    updateData: Partial<User>,
  ): Promise<UpdateResult> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    //handle password update
    if (updateData.password) {
      updateData.password = await this.hashingProvider.hash(
        updateData.password,
      );
    }
    const updatedUser = Object.assign(user, updateData);

    const updatedUserResult: UpdateResult = await this.usersRepository.update(
      id,
      updatedUser,
    );

    return updatedUserResult;
  }

  public async findAdmins(params: {
    roles: RoleType[];
    search?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const { roles, search, isActive, page, limit } = params;
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles });

    if (typeof isActive === 'boolean') {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.email) LIKE :q OR LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q)',
        { q },
      );
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, total, page, limit, totalPages };
  }
}
