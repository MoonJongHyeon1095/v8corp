import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    //1분 10회 제한
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
