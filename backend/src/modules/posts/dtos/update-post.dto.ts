import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({
    example: 'My Updated Post',
    description: 'Id of the post to be updated',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
