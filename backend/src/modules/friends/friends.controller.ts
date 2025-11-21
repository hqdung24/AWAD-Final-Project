import { ActiveUser } from '@/modules/auth/decorator/active-user.decorator';
import type { ActiveUserData } from '@/modules/auth/interfaces/active-user-data.interface';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FriendsListQueryDto } from './dtos/friends-list.query.dto';
import { FriendshipResponseDto } from './dtos/friendship.response';
import { FriendsService } from './providers/friends.service';

@ApiTags('Friends')
@ApiBearerAuth('accessToken')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'List friends for current user' })
  @ApiResponse({ status: 200, type: [FriendshipResponseDto] })
  async list(
    @ActiveUser() user: ActiveUserData,
    @Query() query: FriendsListQueryDto,
  ) {
    return this.friendsService.getFriendsList(user.sub, query);
  }

  @Get('/are-friends/:userId')
  @ApiOperation({
    summary: 'Check if current user is friends with another user with userId',
  })
  @ApiResponse({ status: 200 })
  async areFriends(
    @ActiveUser() user: ActiveUserData,
    @Param('userId') otherUserId: string,
  ) {
    return this.friendsService.areFriends(user.sub, otherUserId);
  }

  @Delete(':otherUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a friend (delete friendship)' })
  async remove(
    @ActiveUser() user: ActiveUserData,
    @Param('otherUserId') otherUserId: string,
  ) {
    await this.friendsService.removeFriend(user.sub, otherUserId);
  }
}
