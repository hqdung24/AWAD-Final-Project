import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import { FileType } from '../enums/file-type.enum';
import { Upload } from '../upload.enity';
@Injectable()
export class UploadService {
  constructor(
    //Inject config service
    private readonly configService: ConfigService,
    //Inject upload repository
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
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

    // Save file info to database
    try {
      // Generate a new entry in the database
      const upload = this.uploadRepository.create({
        name: 'temporary not used',
        path: `https`,
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
