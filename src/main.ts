import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // middle ware를 여러곳에서 사용할 경우 기입
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  // app.use(jwtMiddleware);  app.use()는 functional middleware만 사용 가능
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
