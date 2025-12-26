import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { MediaService } from './media.service';
import { CreatePresignedDto } from './dtos/create-presigned.dto';
import { ConfirmUploadDto } from './dtos/confirm-upload.dto';
import { UploadFormDataDto } from './dtos/upload-form-data.dto';
import { MediaDomain } from './enums/media-domain.enum';
import { MediaType } from './enums/media-type.enum';
import type { Express } from 'express';

@ApiTags('media')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(RoleType.ADMIN, RoleType.USER, RoleType.MODERATOR)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presigned')
  @ApiOperation({ summary: 'Create a presigned upload URL' })
  @ApiBody({ type: CreatePresignedDto })
  createPresigned(@Body() dto: CreatePresignedDto) {
    return this.mediaService.createPresigned(dto);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm an uploaded object and persist media record',
  })
  @ApiBody({ type: ConfirmUploadDto })
  confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.mediaService.confirmUpload(dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file via multipart/form-data' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Multipart upload with file and metadata',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        domain: { type: 'string', enum: Object.values(MediaDomain) },
        domainId: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: Object.values(MediaType) },
      },
      required: ['file', 'domain', 'domainId', 'type'],
    },
  })
  uploadFormData(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFormDataDto,
  ) {
    return this.mediaService.uploadFormData(file, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a media asset and underlying object if present',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }

  @Get()
  @ApiOperation({ summary: 'List media by owner' })
  async listMedia(
    @Query('domain') domain: MediaDomain,
    @Query('domainId') domainId: string,
    @Query('type') type?: MediaType,
  ) {
    return this.mediaService.listMediaByOwner(domain, domainId, type);
  }
}
