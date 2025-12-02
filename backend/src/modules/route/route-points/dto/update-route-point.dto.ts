import { PartialType } from '@nestjs/swagger';
import { CreateRoutePointDto } from './create-route-point.dto';

export class UpdateRoutePointDto extends PartialType(CreateRoutePointDto) {}
