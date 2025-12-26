import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { type ConfigType } from '@nestjs/config';

import { R2StorageProvider } from './providers/r2-storage.provider';
import { MediaRepository } from './providers/media.repository';
import { storageConfig } from '@/config/storage.config';
import { MediaDomain } from './enums/media-domain.enum';
import { MediaType } from './enums/media-type.enum';
import { CreateMediaDto } from './dtos/create-media.dto';

interface CreatePresignedDto {
  domain: MediaDomain;
  domainId: string;
  type: MediaType;
  extension?: string;
}

interface ConfirmUploadDto {
  key: string;
  domain: MediaDomain;
  domainId: string;
  type: MediaType;
}

interface UploadFormDataDto {
  domain: MediaDomain;
  domainId: string;
  type: MediaType;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly r2: R2StorageProvider,
    private readonly repo: MediaRepository,
    @Inject(storageConfig.KEY)
    private readonly cfg: ConfigType<typeof storageConfig>,
  ) {}

  /* -----------------------------
      HELPERS
  ----------------------------- */
  private generateFileKey(dto: {
    domain: MediaDomain;
    domainId: string;
    extension?: string;
  }) {
    const ext = dto.extension?.replace(/^\./, '') || 'bin';
    const basePath = this.cfg.mediaBasePath;
    return `${basePath}/${dto.domain}/${dto.domainId}/${Date.now()}-${randomUUID()}.${ext}`;
  }

  /* -----------------------------
      PRESIGNED FLOW
  ----------------------------- */
  async createPresigned(dto: CreatePresignedDto) {
    const key = this.generateFileKey(dto);

    const uploadUrl = await this.r2.getPresignedPutUrl(key);
    const publicUrl = `${this.cfg.publicUrlBase}/${key}`;

    return {
      key,
      uploadUrl,
      publicUrl,
    };
  }

  async createMedia(media: CreateMediaDto) {
    return this.repo.createMedia(media);
  }

  async confirmUpload(dto: ConfirmUploadDto) {
    const head = await this.r2.headObject(dto.key).catch(() => null);
    const publicUrl = `${this.cfg.publicUrlBase}/${dto.key}`;

    const media = await this.repo.createMedia({
      domain: dto.domain,
      domainId: dto.domainId,
      type: dto.type,
      key: dto.key,
      url: publicUrl,
      mime: head?.ContentType || 'application/octet-stream',
      size: head?.ContentLength ?? 0,
    });

    return media;
  }

  /* -----------------------------
      DIRECT UPLOAD FLOW
  ----------------------------- */
  async uploadFormData(file: Express.Multer.File, dto: UploadFormDataDto) {
    if (!file.originalname.includes('.')) {
      throw new BadRequestException('File must have extension');
    }

    const extension = file.originalname.split('.').pop()!;
    const key = this.generateFileKey({ ...dto, extension });

    await this.r2.putObject(key, file.buffer, file.mimetype);

    const publicUrl = `${this.cfg.publicUrlBase}/${key}`;

    const media = await this.repo.createMedia({
      domain: dto.domain,
      domainId: dto.domainId,
      type: dto.type,
      key,
      url: publicUrl,
      mime: file.mimetype,
      size: file.size,
    });

    return media;
  }

  /* -----------------------------
      DELETE FLOW
  ----------------------------- */
  async deleteMedia(id: string) {
    const existing = await this.repo.getMediaById(id);
    if (!existing) return null;

    if (existing.key) {
      await this.r2.deleteObject(existing.key).catch(() => undefined);
    }

    await this.repo.deleteMedia(id);
    return existing;
  }

  async listMediaByOwner(
    domain: MediaDomain,
    domainId: string,
    type?: MediaType,
  ) {
    return this.repo.getMediaByOwner(domain, domainId, type);
  }
}
