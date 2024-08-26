import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); // ???
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { GlobalExceptionFilter } from './utils/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Setup middleware
  app.use(morgan('dev'));

  // Setup rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in an hour!⌚',
  });

  app.use('/marketAPI', limiter);

  // Setup other middlewares
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xss() as any); // Use 'as any' to suppress TypeScript errors???

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`App running on port ${port}... 🟢`);
}

bootstrap();


