import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  const nodeEnv = configService.get('NODE_ENV', 'development');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const swaggerEnabled =
    configService.get('SWAGGER_ENABLED', 'true') === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('API documentation for Task Management application')
      .setVersion('1.0')
      .addTag('tasks')
      .addTag('projects')
      .addTag('users')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(
      `Swagger documentation available at: http://localhost:${port}/api/docs`,
    );
  }

  // Log environment info
  console.log(`Application running in ${nodeEnv} mode`);

  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
