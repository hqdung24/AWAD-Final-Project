import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengerDetail } from './entities/passenger-detail.entity';
import { PassengerDetailController } from './passenger-detail.controller';
import { PassengerDetailService } from './passenger-detail.service';
import { PassengerDetailRepository } from './passenger-detail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PassengerDetail])],
  controllers: [PassengerDetailController],
  providers: [PassengerDetailService, PassengerDetailRepository],
  exports: [PassengerDetailService, PassengerDetailRepository],
})
export class PassengerDetailModule {}
