import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Media } from '../entities/media.entity';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  /* -----------------------------
      MEDIA CRUD
  ----------------------------- */

  createMedia(data: {
    domain: MediaDomain;
    domainId: string;
    type: MediaType;
    key?: string;
    mime?: string | null;
    size?: number | null;
    url: string;
  }) {
    const entity = this.mediaRepo.create(data);
    return this.mediaRepo.save(entity);
  }

  getMediaById(id: string) {
    return this.mediaRepo.findOne({
      where: { id },
    });
  }

  getManyMedia(ids: string[]) {
    if (!ids.length) return Promise.resolve([]);
    return this.mediaRepo.find({
      where: { id: In(ids) },
    });
  }

  getMediaByOwner(domain: MediaDomain, domainId: string, type?: MediaType) {
    return this.mediaRepo.find({
      where: { domain, domainId, ...(type ? { type } : {}) },
    });
  }

  updateMedia(
    id: string,
    data: Partial<{
      domain: MediaDomain;
      domainId: string;
      type: MediaType;
      key: string;
      mime: string | null;
      size: number | null;
      url: string;
    }>,
  ) {
    return this.mediaRepo.save({ id, ...data });
  }

  deleteMedia(id: string) {
    return this.mediaRepo.softDelete(id);
  }
}
