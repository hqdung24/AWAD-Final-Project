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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@ApiTags('Admin - Operators')
@ApiBearerAuth()
@Controller('admin/operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List operators' })
  async listOperators() {
    return await this.operatorService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get operator detail' })
  async getOperator(@Param('id') id: string) {
    return await this.operatorService.findOne(id);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create operator' })
  async createOperator(@Body() payload: CreateOperatorDto) {
    return await this.operatorService.create(payload);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update operator' })
  async updateOperator(
    @Param('id') id: string,
    @Body() payload: UpdateOperatorDto,
  ) {
    return await this.operatorService.update(id, payload);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete operator' })
  async deleteOperator(@Param('id') id: string) {
    await this.operatorService.remove(id);
    return;
  }
}
