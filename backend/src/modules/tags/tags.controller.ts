import { Body, Controller, Post, Param, Delete } from '@nestjs/common';
import { TagsService } from './providers/tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth('accessToken')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}
  @Post('/')
  public createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Delete('/:tagId')
  public async deleteTag(@Param('tagId') tagId: string) {
    return await this.tagsService.deleteById(tagId);
  }
  @Delete('/:tagId/soft')
  public async softDeleteTag(@Param('tagId') tagId: string) {
    return await this.tagsService.softDeleteById(tagId);
  }
}
