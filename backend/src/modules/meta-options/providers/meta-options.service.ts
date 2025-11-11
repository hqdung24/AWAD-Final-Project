import { Injectable } from '@nestjs/common';
import { PostMetaOptionsDto } from '../dtos/post-meta-options.dto';
import { Repository } from 'typeorm';
import { MetaOption } from '../meta-option.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MetaOptionsService {
  @InjectRepository(MetaOption)
  private readonly metaOptionsRepository: Repository<MetaOption>;
  async create(postMetaOptions: PostMetaOptionsDto) {
    // Logic to create and save meta options
    let newMetaOptions = this.metaOptionsRepository.create(postMetaOptions);
    newMetaOptions = await this.metaOptionsRepository.save(newMetaOptions);
    return newMetaOptions;
  }
}
