import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { CommentModule } from './comment/comment.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AppConfigModule,
    UserModule,
    BoardModule,
    CommentModule,
    StatisticModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
