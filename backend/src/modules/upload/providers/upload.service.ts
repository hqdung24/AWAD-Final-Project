/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { type Express } from 'express';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { Repository } from 'typeorm';
import { Upload } from '../upload.enity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { FileType } from '../enums/file-type.enum';
@Injectable()
export class UploadService {
  constructor(
    //Inject config service
    private readonly configService: ConfigService,
    //Inject upload repository
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,

    //Inject storage provider
    private readonly uploadToAwsProvider: UploadToAwsProvider,
  ) {}
  public async uploadFile(file: Express.Multer.File) {
    //Check mime type and validate file
    if (
      ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(
        file.mimetype,
      ) === false
    ) {
      throw new BadRequestException('Invalid file type');
    }
    //Upload file to S3 or any storage service
    const fileKey = await this.uploadToAwsProvider.fileUpload(file);

    // Save file info to database
    try {
      // Generate a new entry in the database
      const upload = this.uploadRepository.create({
        name: fileKey,
        path: `https://${this.configService.get<string>('app.aws.cloudfrontUrl')}/${fileKey}`,
        type: FileType.IMAGE,
        size: file.size,
        mime: file.mimetype,
      });
      return await this.uploadRepository.save(upload);
    } catch {
      throw new BadRequestException('File upload saved failed');
    }
  }
}
