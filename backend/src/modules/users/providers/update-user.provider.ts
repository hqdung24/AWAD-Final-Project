import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UpdateResult } from 'typeorm/browser';
@Injectable()
export class UpdateUserProvider {
  constructor(
    //Inject user repository
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async updateUser(id: string, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    //verify and update fields
    const updatedUser = Object.assign(user, updateData);

    const updatedUserResult: UpdateResult = await this.userRepository.update(
      id,
      updatedUser,
    );

    return updatedUserResult;
  }
}
