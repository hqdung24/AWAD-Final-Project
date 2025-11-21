import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { type Express } from 'express';
import { UploadService } from './providers/upload.service';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
@Auth(AuthType.None)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @UseInterceptors(FileInterceptor('file'))
  @ApiHeaders([
    { name: 'Content-Type', description: 'multipart/form-data' },
    {
      name: 'Authorization',
      description: 'Bearer token for authentication',
    },
  ])
  @ApiOperation({ summary: 'Upload a file' })
  @Post('file')
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return this.uploadService.uploadFile(file);
  }
}
