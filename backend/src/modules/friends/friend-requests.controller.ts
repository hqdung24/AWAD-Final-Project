import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FriendsService } from './providers/friends.service';
import { CreateFriendRequestDto } from './dtos/create-friend-request.dto';
import { FriendRequestResponseDto } from './dtos/friend-request.response';
import { ListFriendRequestsQueryDto } from './dtos/list-friend-requests.query.dto';
import { ActiveUser } from '@/modules/auth/decorator/active-user.decorator';
import type { ActiveUserData } from '@/modules/auth/interfaces/active-user-data.interface';
import { plainToInstance } from 'class-transformer';

@ApiTags('Friend Requests')
@ApiBearerAuth('accessToken')
@Controller('friend-requests')
export class FriendRequestsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @ApiOperation({ summary: 'Create friend request' })
  @ApiResponse({ status: 201, type: FriendRequestResponseDto })
  async create(
    @ActiveUser() user: ActiveUserData,
    @Body() body: CreateFriendRequestDto,
  ) {
    // user.sub is current user id (string UUID)
    const result = await this.friendsService.createFriendRequest(
      user.sub,
      body,
    );
    return plainToInstance(FriendRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/to-me')
  @ApiOperation({ summary: 'List friend requests sent to me' })
  @ApiResponse({ status: 200, type: [FriendRequestResponseDto] })
  async list(
    @ActiveUser() user: ActiveUserData,
    @Query() query: ListFriendRequestsQueryDto,
  ) {
    console.log('finding friend request sent to me', user.sub);
    const result = await this.friendsService.listFriendRequestsToMe(
      user.sub,
      query,
    );
    return plainToInstance(FriendRequestResponseDto, result, {
      excludeExtraneousValues: true,
    }); //class transformer auto maps arrays of DTOs
  }

  @Get('/from-me')
  @ApiOperation({ summary: 'List friend requests sent from me' })
  @ApiResponse({ status: 200, type: [FriendRequestResponseDto] })
  async listFromMe(
    @ActiveUser() user: ActiveUserData,
    @Query() query: ListFriendRequestsQueryDto,
  ) {
    const result = await this.friendsService.listFriendRequestsFromMe(
      user.sub,
      query,
    ); //array of friend requests
    return plainToInstance(FriendRequestResponseDto, result, {
      excludeExtraneousValues: true,
    }); //class transformer auto maps arrays of DTOs
  }

  //Not yet create response serializer
  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiResponse({ status: 200 })
  async accept(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
    return this.friendsService.acceptFriendRequest(user.sub, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a friend request' })
  @ApiResponse({ status: 200 })
  async reject(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
    return this.friendsService.rejectFriendRequest(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a friend request' })
  async cancel(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
    await this.friendsService.cancelFriendRequest(user.sub, id);
  }
}
