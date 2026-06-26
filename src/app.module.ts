import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackController } from './tracks/track.controller';
import { TrackService } from './tracks/track.service';
import { SoundcloudInterfaceController } from './soundcloud-interface/scinterface.controller';
import { SoundcloudInterfaceService } from './soundcloud-interface/scinterface.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackSource } from './tracksources/tracksource.entity';
import { Track } from './tracks/track.entity';
import { Artist } from './artists/artist.entity';
import { Tag } from './tags/tag.entity';
import { SoundcloudInterfaceModule } from './soundcloud-interface/scinterface.module';

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
        entities: [TrackSource, Track, Artist, Tag],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    SoundcloudInterfaceModule,
  ],
  controllers: [AppController, TrackController],
  providers: [AppService, TrackService],
})
export class AppModule {}
