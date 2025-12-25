import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { MediaController } from './media.controller';
import { Media } from './entities/media.entity';
import { R2StorageProvider } from './providers/r2-storage.provider';
import { MediaRepository } from './providers/media.repository';
import { MediaService } from './media.service';
import { storageConfig } from '@/config/storage.config';

@Module({
  providers: [R2StorageProvider, MediaRepository, MediaService],
  controllers: [MediaController],
  exports: [R2StorageProvider, MediaRepository, MediaService],
  imports: [
    TypeOrmModule.forFeature([Media]),
    ConfigModule.forFeature(storageConfig),
  ],
})
export class MediaModule {}
