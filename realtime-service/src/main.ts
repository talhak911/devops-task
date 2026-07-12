import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global API prefix
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // Use global exception filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const originsConfig = configService.get<string>('CORS_ORIGINS');
      const allowedOrigins = originsConfig
        ? originsConfig.split(',').map((o) => o.trim().replace(/\/$/, ''))
        : ['http://localhost:5173', 'http://localhost:3000'];

      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 5006;
  await app.listen(port);
  console.log(
    `Real-Time Service is running on: http://localhost:${port}/api/v1`,
  );
}
bootstrap();
