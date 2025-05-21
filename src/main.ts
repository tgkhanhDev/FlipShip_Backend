import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './exception/appFilter.pipe';
import { ValidationPipe } from './validators/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //CORS
  app.enableCors({
    origin: ['http://192.168.1.16:8081', 'http://localhost:3000'],
  });

  //pipe
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
