import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { AuthUserDto } from '../auth/dtos/signin-response.dto';
import { GetUsersParamsDto } from './dtos/get-user-params.dto';
import { UsersService } from './providers/users.service';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  async getMe(@ActiveUser('sub') id: string) {
    const currentUser = await this.usersService.findById(id);
    console.log(currentUser);
    return new AuthUserDto(currentUser);
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

  // @Patch()
  // async patchUser(@Body() body: PatchUserDto) {
  //   const result = await this.usersService.patchUser(body);
  //   return { msg: 'ok', result };
  // }
}
