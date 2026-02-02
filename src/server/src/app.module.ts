import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { PagesModule } from './pages/pages.module';
import { StatsModule } from './stats/stats.module';
import { WebhookModule } from './webhook/webhook.module';
import { SpaModule } from './spa.module';
import { Tenant } from './pages/tenant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        fallthrough: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || '/usr/src/app/data/viral_game.sqlite',
      entities: [Tenant],
      synchronize: true, // Auto-create tables (Dev/Simple Prod)
    }),
    PagesModule,
    StatsModule,
    WebhookModule,
    SpaModule, // Import last to give lowest routing priority
  ],
})
export class AppModule {}