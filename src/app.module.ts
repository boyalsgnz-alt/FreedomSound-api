import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackController } from './tracks/track.controller';
import { TrackService } from './tracks/track.service';
import { SoundcloudInterfaceController } from './soundcloud-interface/scinterface.controller';
import { SoundcloudInterfaceService } from './soundcloud-interface/scinterface.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: configService.getOrThrow<string>('MYSQL_USER'),
        password: configService.getOrThrow<string>('MYSQL_PASSWORD'),
        database: configService.getOrThrow<string>('MYSQL_ROOT_DBNAME'),
        entities: [],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, TrackController, SoundcloudInterfaceController],
  providers: [AppService, TrackService, SoundcloudInterfaceService],
})
export class AppModule {}
