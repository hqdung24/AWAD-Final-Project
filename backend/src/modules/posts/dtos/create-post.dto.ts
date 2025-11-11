import { postStatus } from '../enums/postStatus.enum';
import { postType } from '../enums/postType.enum';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PostMetaOptionsDto } from '../../meta-options/dtos/post-meta-options.dto';
export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Title of the post' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'blog', description: 'Type of the post' })
  @IsEnum(postType)
  @IsNotEmpty()
  postType: postType;

  @ApiProperty({ example: 'my-first-post', description: 'Slug of the post' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be URL friendly',
  })
  @MaxLength(256)
  slug: string;

  @ApiProperty({ example: 'draft', description: 'Status of the post' })
  @IsEnum(postStatus)
  @IsNotEmpty()
  status: postStatus;

  @ApiProperty({
    example: 'This is the content of my first post.',
    description: 'Content of the post',
    required: false,
  })
  @IsString()
  content?: string;

  @ApiProperty({
    example: '{"type":"object","properties":{"body":{"type":"string"}}}',
    description: 'JSON schema of the post content',
    required: false,
  })
  @IsString()
  @IsJSON()
  schema?: string;

  @IsString()
  @IsUrl()
  @MaxLength(1024)
  @IsOptional()
  @ApiProperty({
    example: 'https://example.com/featured-image.jpg',
    description: 'URL of the featured image',
    required: false,
  })
  featuredImage?: string;

  @ApiProperty({
    example: '2023-03-15T12:00:00Z',
    description: 'Publication date of the post',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedOn?: Date;

  @ApiProperty({
    example: ['tech', 'nestjs'],
    description: 'Tags associated with the post',
    required: false,
    isArray: true,
    type: 'array',
    items: {
      type: 'string',
      example: 'tech',
    },
  })
  @ApiProperty({
    example: ['tech', 'nestjs'],
    description: 'Tag slugs associated with the post',
    required: false,
  })
  @IsArray()
  @IsString({
    each: true,
    message: 'Each tag must be a string',
  })
  @MinLength(1, { each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Key-value meta options for the post',
    required: false,
    type: PostMetaOptionsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PostMetaOptionsDto)
  @IsOptional()
  metaOptions?: PostMetaOptionsDto;
}
