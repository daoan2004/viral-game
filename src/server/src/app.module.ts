import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { FirebaseModule } from './firebase/firebase.module';
import { PagesModule } from './pages/pages.module';
import { StatsModule } from './stats/stats.module';
import { SpaController } from './spa.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
      serveStaticOptions: {
        fallthrough: true,
      },
    }),
    FirebaseModule,
    PagesModule,
    StatsModule,
  ],
  controllers: [SpaController],
})
export class AppModule {}