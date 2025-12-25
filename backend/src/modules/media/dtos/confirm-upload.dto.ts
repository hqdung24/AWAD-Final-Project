import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'Object storage key used during presign' })
  @IsString()
  key: string;

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
