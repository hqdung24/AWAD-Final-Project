import { Controller } from '@nestjs/common';
import { MediaService } from './providers/media.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('media')
@ApiBearerAuth('accessToken')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
}
