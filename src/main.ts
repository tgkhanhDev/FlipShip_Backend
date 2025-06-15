import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './exception/appFilter.pipe';
import { ValidationPipe } from './validators/validation.pipe';

//Xoá ngork khi deploy, không cần thiết khi deploy

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CORS
  app.enableCors({
    origin: ['*', "http://localhost:3000"],
  });

  //pipe
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
