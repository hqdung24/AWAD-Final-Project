import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { CreatePostDto } from './dtos/create-post.dto';
import { GetPostsDto } from './dtos/get-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostsService } from './providers/posts.service';

@ApiBearerAuth('accessToken')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/:userId')
  public getPosts(
    @Param('userId') userId: string,
    @Query() postQuery: GetPostsDto,
  ) {
    return this.postsService.findAllByUserId(userId, postQuery);
  }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been created successfully.',
  })
  @Post('/')
  public createPost(
    @Body() body: CreatePostDto,
    @ActiveUser('sub') userId: string,
  ) {
    try {
      return this.postsService.create(userId, body);
    } catch (error) {
      console.error('Error updating post:', error);
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      return { msg: 'error', error: message };
    }
  }

  @Patch('/')
  public patchPost(@Body() body: UpdatePostDto) {
    return this.postsService.updatePost(body);
  }

  @Delete('/:postId')
  public async deletePost(@Param('postId') postId: string) {
    try {
      return await this.postsService.delete(postId);
    } catch (error: unknown) {
      console.error('Error deleting post:', error);
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      return { msg: 'error', error: message };
    }
  }
}
