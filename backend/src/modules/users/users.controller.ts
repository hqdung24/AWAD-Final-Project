import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { AuthUserDto } from '../auth/dtos/signin-response.dto';
import { GetUsersParamsDto } from './dtos/get-user-params.dto';
import { UsersService } from './providers/users.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto, SetPasswordDto } from './dtos/change-password.dto';
import { MediaService } from '../media/media.service';
import { ConfirmUploadDto } from '../media/dtos/confirm-upload.dto';

@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('/me')
  async getMe(@ActiveUser('sub') id: string) {
    const currentUser = await this.usersService.findOneById(id);
    return new AuthUserDto(currentUser);
  }

  @Patch('/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @ActiveUser('sub') id: string,
    @Body() payload: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(id, payload);
    return new AuthUserDto(updated);
  }

  @Patch('/me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @ActiveUser('sub') id: string,
    @Body() payload: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(id, payload);
    return { message: 'Password updated' };
  }
  @Get('/:id')
  @ApiOperation({ summary: 'Fetch user by id' })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'The nymber of entries returned par page',
    example: '10',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'The nymber of entries returned par page',
    example: '10',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
  })
  getUsers(
    @Param() params: GetUsersParamsDto,
    @Query(
      'limit',
      new DefaultValuePipe(10),
      new ParseIntPipe({ optional: true }),
    )
    limit: number,
    @Query(
      'page',
      new DefaultValuePipe(1),
      new ParseIntPipe({ optional: true }),
    )
    page: number,
  ) {
    return this.usersService.findAll(params, limit, page);
  }

  @Patch('me/set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password for users registered via OAuth' })
  async setPassword(
    @ActiveUser('sub') id: string,
    @Body() payload: SetPasswordDto,
  ) {
    await this.usersService.setPassword(id, payload.newPassword);
    return { message: 'Password set successfully' };
  }

  @Post('me/confirm-avatar-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm avatar upload and bind to user',
  })
  async confirmAvatarUpload(
    @ActiveUser('sub') id: string,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.usersService.confirmAvatarUpload(id, dto);
  }

  // @Patch()
  // async patchUser(@Body() body: PatchUserDto) {
  //   const result = await this.usersService.patchUser(body);
  //   return { msg: 'ok', result };
  // }
}
