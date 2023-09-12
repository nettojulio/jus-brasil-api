import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LawsuitModule } from './lawsuit/lawsuit.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot:
        process.env.SWAGGER_DOC_ENV === 'development' ? '/' : '/swagger',
    }),
    LawsuitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
