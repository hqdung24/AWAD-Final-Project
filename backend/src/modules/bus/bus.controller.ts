import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusService } from './bus.service';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@ApiTags('Admin - Buses')
@ApiBearerAuth()
@Controller('admin/buses')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List buses' })
  @ApiResponse({ status: 200, description: 'Buses retrieved successfully' })
  async listBuses(
    @Query() query: { operatorId?: string; page?: number; limit?: number },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const [buses] = await this.busService.findAll({
      operatorId: query.operatorId,
      isActive: true,
      page,
      limit,
    });
    return buses;
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create bus' })
  async createBus(@Body() dto: CreateBusDto) {
    return await this.busService.create(dto);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update bus' })
  async updateBus(@Param('id') id: string, @Body() dto: UpdateBusDto) {
    return await this.busService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete bus' })
  async deleteBus(@Param('id') id: string) {
    await this.busService.softDelete(id);
  }
}
