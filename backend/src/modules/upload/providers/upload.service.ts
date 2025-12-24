import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import { FileType } from '../enums/file-type.enum';
import { Upload } from '../upload.enity';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
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
    const uploadsDir = join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const extension = extname(file.originalname) || '';
    const filename = `${Date.now()}-${randomUUID()}${extension}`;
    const destination = join(uploadsDir, filename);

    if (file.buffer) {
      await fs.writeFile(destination, file.buffer);
    } else if ((file as any).path) {
      await fs.copyFile((file as any).path, destination);
    } else {
      throw new BadRequestException('Unsupported upload storage');
    }

    const backendUrl = this.configService.get<string>('app.backendUrl') || 'http://localhost:3000';
    const publicUrl = `${backendUrl}/uploads/${filename}`;

    // Save file info to database
    try {
      // Generate a new entry in the database
      const upload = this.uploadRepository.create({
        name: file.originalname,
        path: publicUrl,
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
