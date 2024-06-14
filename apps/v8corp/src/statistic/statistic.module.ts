import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ViewRepository } from 'src/board/view.repository';
import { StatisticService } from './statistic.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [StatisticService, ViewRepository],
})
export class StatisticModule {}
