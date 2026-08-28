import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FreedomSound')
    .setDescription('The API documentation build for FreedomSound')
    .setVersion('1.0')
    .addTag('freedom-sound')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  console.log(`API will now listen on ${process.env.API_PORT ?? 3000}`);
  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
