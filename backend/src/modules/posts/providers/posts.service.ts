import { PaginationProvider } from '@/common/pagination/providers/pagination.provider';
import { TagsService } from '@/modules/tags/providers/tags.service';
import { UsersService } from '@/modules/users/providers/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../dtos/create-post.dto';
import { GetPostsDto } from '../dtos/get-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { Post } from '../post.entity';
import { Paginated } from '@/common/pagination/interfaces/paginated.interface';
import { CreatePostProvider } from './create-post.provider';

@Injectable()
export class PostsService {
  constructor(
    private readonly tagService: TagsService,
    private readonly userService: UsersService,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly paginationProvider: PaginationProvider,

    private readonly createPostProvider: CreatePostProvider,
  ) {}

  public async findAllByUserId(
    userId: string,
    query: GetPostsDto,
  ): Promise<Paginated<Post>> {
    // mặc định
    query.page ||= 1;
    query.limit ||= 10;

    return this.paginationProvider.paginateQuery(query, this.postsRepository, {
      where: { author: { id: userId } },
      relations: { metaOptions: true, author: true, tags: true },
      order: { publishedOn: 'DESC' }, // ví dụ
    });
  }

  public async create(userId: string, postData: CreatePostDto) {
    return await this.createPostProvider.createPost(userId, postData);
  }

  public async updatePost(patchPost: UpdatePostDto) {
    const existingPost = await this.postsRepository.findOne({
      where: { id: patchPost.id },
      relations: { tags: true },
    });
    if (!existingPost) {
      throw new Error('Post not found');
    }
    const existingTags = await this.tagService.findMultipleBySlugs(
      patchPost.tags || [],
    );

    existingPost.title = patchPost.title ?? existingPost.title;
    existingPost.content = patchPost.content ?? existingPost.content;
    existingPost.postType = patchPost.postType ?? existingPost.postType;
    existingPost.schema = patchPost.schema ?? existingPost.schema;
    existingPost.featuredImage =
      patchPost.featuredImage ?? existingPost.featuredImage;
    existingPost.slug = patchPost.slug ?? existingPost.slug;
    existingPost.status = patchPost.status ?? existingPost.status;
    existingPost.tags =
      existingTags.length > 0 ? existingTags : existingPost.tags;
    return await this.postsRepository.save(existingPost);
  }

  public async delete(postId: string) {
    await this.postsRepository.delete(postId);

    return { msg: 'success' };
  }
}
