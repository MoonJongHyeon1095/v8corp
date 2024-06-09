import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ViewRepository } from 'src/board/view.repository';

@Injectable()
export class StatisticService {
  private readonly timeZone = 'Asia/Seoul';
  constructor(private readonly viewRepository: ViewRepository) {
    this.scheduleWeeklyJob();
    this.scheduleMonthlyJob();
    this.scheduleAnnualJob();
  }

  private async handleCron(
    timeSpan: 'week' | 'month' | 'year',
    fieldToUpdate: 'weeklyView' | 'monthlyView' | 'annualView',
  ) {
    const currentDate = new Date();
    const pastDate = new Date();
    switch (timeSpan) {
      case 'week':
        pastDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        pastDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        pastDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }

    await this.viewRepository.updatePeriodViewCount(pastDate, fieldToUpdate);
  }

  //매일 0시 주간통계
  private scheduleWeeklyJob() {
    const job = new CronJob(
      '0 0 * * *',
      () => this.handleCron('week', 'weeklyView'),
      null,
      true,
      this.timeZone,
    );
    job.start();
  }

  //매일 1시 월간 통계
  private scheduleMonthlyJob() {
    const job = new CronJob(
      '0 1 * * *',
      () => this.handleCron('month', 'monthlyView'),
      null,
      true,
      this.timeZone,
    );
    job.start();
  }

  //매주 일요일 0시 연간 통계
  private scheduleAnnualJob() {
    const job = new CronJob(
      '0 0 * * 0',
      () => this.handleCron('year', 'annualView'),
      null,
      true,
      this.timeZone,
    );
    job.start();
  }
}
