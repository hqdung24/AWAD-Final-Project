import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { GoogleUser } from '../interfaces/googleUser';
@Injectable()
export class CreateGoogleUserProvider {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  public async createGoogleUser(googleUser: GoogleUser) {
    try {
      const newUser = this.usersRepository.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        googleId: googleUser.googleId,
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      throw new ConflictException(error, 'Error creating Google user');
    }
  }
}
