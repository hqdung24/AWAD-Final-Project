import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';

export class CreateMediaDto {
  @ApiProperty({ enum: MediaDomain })
  @IsEnum(MediaDomain)
  domain: MediaDomain;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  domainId: string;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ description: 'Public URL to access the media' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Object storage key (path within bucket)',
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiPropertyOptional({
    description: 'MIME type of the media, e.g. image/png',
  })
  @IsOptional()
  @IsString()
  mime?: string;
}
