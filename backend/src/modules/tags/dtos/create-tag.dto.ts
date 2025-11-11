import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Technology', description: 'The name of the tag' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'technology', description: 'The slug of the tag' })
  @IsString()
  @MaxLength(256)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @MaxLength(256)
  slug: string;

  @ApiProperty({
    example: 'A tag for all things technology.',
    description: 'A brief description of the tag',
  })
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsJSON()
  schema?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  featuredImage?: string;
}
