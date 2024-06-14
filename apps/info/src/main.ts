import { NestFactory } from '@nestjs/core';
import { InfoModule } from './info.module';

async function bootstrap() {
  const app = await NestFactory.create(InfoModule);
  await app.listen(3001);
}
bootstrap();
