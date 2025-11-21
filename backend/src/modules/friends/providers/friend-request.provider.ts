/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FriendRequest } from '../entities/friend_request.entity';
import { Friendship } from '../entities/friendship.entity';
import { FriendRequestStatus } from '../entities/friend_request.entity';
@Injectable()
export class FriendRequestProvider {
  constructor(
    //Inject Friend Request Repository
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,

    //Inject Friendship Repository
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,

    //Inject Data Source
    private readonly dataSource: DataSource,
  ) {}

  //List of friend requests from me
  async listFriendRequestsFromMe(userId: string) {
    const requests = await this.friendRequestRepository.find({
      where: { fromUserId: userId, status: FriendRequestStatus.PENDING },
    });
    if (!requests || requests.length === 0) {
      throw new NotFoundException('No friend requests found from this user');
    }
    return requests;
  }

  //List of friend requests to me
  async listFriendRequestsToMe(userId: string) {
    const requests = await this.friendRequestRepository.find({
      where: { toUserId: userId, status: FriendRequestStatus.PENDING },
    });
    return requests;
  }

  //Method to get a specific friend request by ID
  async getFriendRequestById(requestId: string) {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }
    return request;
  }

  //Method to delete a friend request by ID
  async deleteFriendRequest(requestId: string) {
    const result = await this.friendRequestRepository.delete({ id: requestId });
    if (result.affected === 0) {
      throw new NotFoundException('Friend request not found');
    }
    return;
  }

  //Method to create a new friend request
  async createFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      if (fromUserId === toUserId)
        throw new BadRequestException('Cannot friend yourself');

      // 1) check existing friendship (either order)
      const existing = await qr.manager.findOne(Friendship, {
        where: [
          { userAId: fromUserId, userBId: toUserId },
          { userAId: toUserId, userBId: fromUserId },
        ],
      });
      if (existing) {
        await qr.rollbackTransaction();
        throw new ConflictException('Already friends');
      }

      // 2) check existing pending request either direction
      // If there is an existing pending request, return it instead of creating a new one
      // Ensure idempotency, not bidirectional requests
      const pending = await qr.manager.findOne(FriendRequest, {
        where: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }, // reverse request exists, cannot create new
        ],
      });
      if (pending) {
        await qr.rollbackTransaction();
        // return existing pending or throw depending desired behaviour
        return pending;
      }

      // 3) create request
      const req = qr.manager.create(FriendRequest, {
        fromUserId,
        toUserId,
        message,
      });
      const saved = await qr.manager.save(FriendRequest, req);

      await qr.commitTransaction();
      return saved;
    } catch (err) {
      await qr.rollbackTransaction();
      // if duplicate unique (race): handle gracefully
      if (err?.code === '23505') {
        // Postgres unique violation
        // fetch existing and return or throw conflict
        const existing = await qr.manager.findOne(FriendRequest, {
          where: { fromUserId, toUserId },
        });
        if (existing) return existing;
        throw new ConflictException('Friend request already exists');
      }
      throw err;
    } finally {
      await qr.release();
    }
  }

  async acceptRequest(requestId: string, accepterId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    const req = await qr.manager.findOne(FriendRequest, {
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Friend request not found');

    //
    try {
      if (req.toUserId !== accepterId) throw new ForbiddenException();

      // check existing friendship again (defense-in-depth)
      const a = req.fromUserId;
      const b = req.toUserId;
      const [userAId, userBId] = a < b ? [a, b] : [b, a];

      const existing = await qr.manager.findOne(Friendship, {
        where: { userAId, userBId },
      });
      if (existing != null) {
        // already friends -> update request status and return existing or throw
        await qr.manager.update(
          FriendRequest,
          { id: requestId },
          { status: FriendRequestStatus.ACCEPTED },
        );
        await qr.commitTransaction();
        return existing;
      }

      // create friendship
      const friendship = qr.manager.create(Friendship, { userAId, userBId });
      await qr.manager.save(Friendship, friendship);

      // update the status
      await qr.manager.update(
        FriendRequest,
        { id: requestId },
        { status: FriendRequestStatus.ACCEPTED },
      );

      await qr.commitTransaction();
      return friendship;
    } catch (err) {
      await qr.rollbackTransaction();
      // handle unique violation (concurrent accept) gracefully
      if (err?.code === '23505') {
        // Another transaction accepted at the same time → load the resulting friendship
        const userAId =
          req.fromUserId < req.toUserId ? req.fromUserId : req.toUserId;
        const userBId =
          req.fromUserId < req.toUserId ? req.toUserId : req.fromUserId;

        const f = await this.friendshipRepository.findOne({
          where: { userAId, userBId },
        });
        if (f) return f; // return the existing friendship idempotently
      }
      throw err;
    } finally {
      await qr.release();
    }
  }

  async rejectRequest(requestId: string, rejecterId: string) {
    //implement reject logic

    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.toUserId !== rejecterId) {
      throw new ForbiddenException(
        'You are not authorized to reject this request',
      );
    }

    //update status to rejected
    const result = await this.friendRequestRepository.update(
      { id: requestId },
      { status: FriendRequestStatus.REJECTED },
    );
    return result;
  }

  async cancelRequest(requestId: string, cancelerId: string) {
    //cancel should be the sender
    //implement cancel logic
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.fromUserId !== cancelerId) {
      throw new ForbiddenException(
        'You are not authorized to cancel this request',
      );
    }

    //update status to canceled
    const result = await this.friendRequestRepository.update(
      { id: requestId },
      { status: FriendRequestStatus.CANCELED },
    );

    return result;
  }
}
