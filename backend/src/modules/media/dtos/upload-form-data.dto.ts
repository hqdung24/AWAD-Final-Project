import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';

export class UploadFormDataDto {
  @ApiProperty({ enum: MediaDomain })
  @IsEnum(MediaDomain)
  domain: MediaDomain;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  domainId: string;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;
}
