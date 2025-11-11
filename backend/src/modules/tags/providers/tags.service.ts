import { Injectable } from '@nestjs/common';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { Repository } from 'typeorm';
import { Tag } from '../tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}
  public async create(createTagDto: CreateTagDto) {
    const tag = this.tagsRepository.create(createTagDto);
    return this.tagsRepository.save(tag);
  }

  public async findByName(name: string) {
    return this.tagsRepository.findOne({ where: { name } });
  }

  public async findBySlug(slug: string) {
    return this.tagsRepository.findOne({ where: { slug } });
  }

  public async findMultipleBySlugs(slugs: string[]) {
    if (!slugs || slugs.length === 0) {
      return [];
    }
    return this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.slug IN (:...slugs)', { slugs })
      .getMany();
  }

  public async deleteById(id: string) {
    await this.tagsRepository.delete(id);
    return { msg: 'success' };
  }

  public async softDeleteById(id: string) {
    await this.tagsRepository.softDelete(id);
    return { msg: 'success' };
  }
}
