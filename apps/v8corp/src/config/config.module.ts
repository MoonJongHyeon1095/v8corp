// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 ConfigModule을 사용할 수 있도록 설정
    }),
  ],
})
export class AppConfigModule {}
