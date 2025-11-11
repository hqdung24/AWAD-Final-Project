import { Module } from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaOptionsModule } from '../meta-options/meta-options.module';
import { TagsModule } from '../tags/tags.module';
import { MetaOption } from '../meta-options/meta-option.entity';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { CreatePostProvider } from './providers/create-post.provider';
@Module({
  providers: [PostsService, CreatePostProvider],
  controllers: [PostsController],
  imports: [
    UsersModule,
    MetaOptionsModule,
    TagsModule,
    TypeOrmModule.forFeature([Post, MetaOption]),
    PaginationModule,
  ],
})
export class PostsModule {}
