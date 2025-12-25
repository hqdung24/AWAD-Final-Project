import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';

export class CreatePresignedDto {
  @ApiProperty({ enum: MediaDomain })
  @IsEnum(MediaDomain)
  domain: MediaDomain;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  domainId: string;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ description: 'File extension without dot, e.g. jpg' })
  @IsOptional()
  @IsString()
  extension?: string;
}
