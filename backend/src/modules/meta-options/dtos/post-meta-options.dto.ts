import { IsObject, IsNotEmpty } from 'class-validator';

export class PostMetaOptionsDto {
  @IsObject()
  @IsNotEmpty()
  metaValue: Record<string, any>;
}
