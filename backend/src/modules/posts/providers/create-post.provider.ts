import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { TagsService } from '@/modules/tags/providers/tags.service';
import { UsersService } from '@/modules/users/providers/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../post.entity';

@Injectable()
export class CreatePostProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly userService: UsersService,
    private readonly tagService: TagsService,
  ) {}
  public async createPost(userId: string, postData: CreatePostDto) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new Error('Author not found');
    }
    const tags = await this.tagService.findMultipleBySlugs(postData.tags || []);
    const post = this.postsRepository.create({
      ...postData,
      author: user,
      tags,
    });
    const newPost = await this.postsRepository.save(post);
    return newPost;
  }
}
