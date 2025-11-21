import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { UploadService } from './providers/upload.service';
import { UploadController } from './upload.controller';
import { Upload } from './upload.enity';

@Module({
  providers: [UploadService, UploadToAwsProvider],
  controllers: [UploadController],
  exports: [UploadService],
  imports: [TypeOrmModule.forFeature([Upload])],
})
export class UploadModule {}
