import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user.entity';
@Injectable()
export class FindManyUsersProvider {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async findManyByIds(userIds: string[]) {
    const users = await this.usersRepository.findBy({ id: In(userIds) });
    return users;
  }
}
