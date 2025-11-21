import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from '../entities/friendship.entity';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/user.entity';

@Injectable()
export class FriendshipProvider {
  constructor(
    /* Inject dependencies here */
    //Inject friendship repository
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {}

  //list of friendships for a user
  async listFriends(userId: string): Promise<User[]> {
    const friendships = await this.friendshipRepository.find({
      where: [{ userAId: userId }, { userBId: userId }], // find friendships involving the user, user can be either userA or userB
      relations: ['userA', 'userB'], // load user relations
    });

    // Extract the friends from the friendships
    const friends: User[] = friendships.map((friendship) => {
      if (friendship.userAId === userId) {
        return friendship.userB;
      } else {
        return friendship.userA;
      }
    });
    return friends;
  }

  // create a new friendship from to user IDs
  async createFriendship(userId1: string, userId2: string) {
    //check if friendship already exists
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { userAId: userId1, userBId: userId2 },
        { userAId: userId2, userBId: userId1 },
      ],
    });
    if (existingFriendship) {
      return existingFriendship;
    }

    const friendship = this.friendshipRepository.create({
      userAId: userId1,
      userBId: userId2,
    });
    return this.friendshipRepository.save(friendship);
  }

  // delete a friendship by ID
  async deleteFriendship(userId1: string, userId2: string) {
    //check if friendship exists
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { userAId: userId1, userBId: userId2 },
        { userAId: userId2, userBId: userId1 },
      ],
    });
    if (!existingFriendship) {
      throw new Error('Friendship has already been deleted');
    }
    return this.friendshipRepository.delete(existingFriendship.id);
  }

  async areFriend(
    currentUserId: string,
    otherUserId: string,
  ): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userAId: currentUserId, userBId: otherUserId },
        { userAId: otherUserId, userBId: currentUserId },
      ],
    });
    return !!friendship;
  }
}
