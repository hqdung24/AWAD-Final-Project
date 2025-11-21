import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendRequestsController } from './friend-requests.controller';
import { FriendsService } from './providers/friends.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { FriendRequest } from './entities/friend_request.entity';
import { Friendship } from './entities/friendship.entity';
import { FriendRequestProvider } from './providers/friend-request.provider';
import { FriendshipProvider } from './providers/friendship.provider';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  controllers: [FriendsController, FriendRequestsController],
  providers: [FriendsService, FriendRequestProvider, FriendshipProvider],
  exports: [FriendsService],
  imports: [
    TypeOrmModule.forFeature([FriendRequest, Friendship]),
    ConversationsModule,
  ],
})
export class FriendsModule {}
