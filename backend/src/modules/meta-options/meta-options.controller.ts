import { Controller, Post, Body } from '@nestjs/common';
import { PostMetaOptionsDto } from './dtos/post-meta-options.dto';
import { MetaOptionsService } from './providers/meta-options.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('meta-options')
@ApiBearerAuth('accessToken')
export class MetaOptionsController {
  constructor(private readonly metaOptionsService: MetaOptionsService) {}

  @Post()
  async createMetaOptions(@Body() postMetaOptions: PostMetaOptionsDto) {
    return this.metaOptionsService.create(postMetaOptions);
  }
}
