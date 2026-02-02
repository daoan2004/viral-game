import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, NotFoundException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('LuckyBot API')
    .setDescription('API documentation for LuckyBot Facebook Marketing Tool')
    .setVersion('1.0')
    .addTag('pages', 'Facebook Pages management')
    .addTag('stats', 'Statistics endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Proxy /webhook to AI Service (Python)
  // This is needed for production/docker where Vite proxy is not checking
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8080';
  const { createProxyMiddleware } = require('http-proxy-middleware');

  app.use(
    '/webhook',
    createProxyMiddleware({
      target: aiServiceUrl,
      changeOrigin: true,
      logLevel: 'debug', 
    }),
  );

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 LuckyBot API running on http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();