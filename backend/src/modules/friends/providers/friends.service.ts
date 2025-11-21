/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { FriendRequestProvider } from './friend-request.provider';
import { FriendshipProvider } from './friendship.provider';
import { ConversationsService } from '@/modules/conversations/providers/conversations.service';

@Injectable()
export class FriendsService {
  /* Friend requests API stubs */
  constructor(
    //Inject friend request provider
    private readonly friendRequestProvider: FriendRequestProvider,

    //Inject friendship provider
    private readonly friendshipProvider: FriendshipProvider,

    //Inject conversation service
    private readonly conversationsService: ConversationsService,
  ) {}

  async createFriendRequest(
    fromUserId: string,
    body: { toUserId: string; message?: string },
  ) {
    // perform create friend request
    const friendRequest = await this.friendRequestProvider.createFriendRequest(
      fromUserId,
      body.toUserId,
      body.message,
    );
    return friendRequest;
  }

  async listFriendRequestsFromMe(userId: string, query: any) {
    //log the queries for debugging first, implement later
    console.log('Query parameters:', query);

    const requests =
      await this.friendRequestProvider.listFriendRequestsFromMe(userId);
    return requests;
  }

  async listFriendRequestsToMe(userId: string, query: any) {
    //log the queries for debugging first, implement later
    console.log('Query parameters:', query);

    const requests =
      await this.friendRequestProvider.listFriendRequestsToMe(userId);
    return requests;
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    // perform create friendship and mark request accepted
    const friendship = await this.friendRequestProvider.acceptRequest(
      requestId,
      userId,
    );

    //create a direct conversation between new friends
    await this.conversationsService.createDirectConversation(
      friendship.userAId,
      friendship.userBId,
    );

    return friendship;
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const result = await this.friendRequestProvider.rejectRequest(
      requestId,
      userId,
    );
    return result;
  }

  async cancelFriendRequest(userId: string, requestId: string) {
    const result = await this.friendRequestProvider.cancelRequest(
      requestId,
      userId,
    );
    return result;
  }

  /* Friendships API stubs */
  async getFriendsList(userId: string, query: any) {
    return [
      {
        id: globalThis.crypto?.randomUUID?.() ?? String(1),
        user_id: userId,
        friend_id: '2',
        created_at: new Date().toISOString(),
      },
    ];
  }

  async removeFriend(userId: string, otherUserId: string): Promise<void> {
    await this.friendshipProvider.deleteFriendship(userId, otherUserId);
    return;
  }

  async areFriends(userId: string, otherUserId: string): Promise<boolean> {
    const result = this.friendshipProvider.areFriend(userId, otherUserId);
    return result;
  }
}
