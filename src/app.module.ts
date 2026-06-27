import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackSource } from './tracksources/tracksource.entity';
import { Track } from './tracks/track.entity';
import { Artist } from './artists/artist.entity';
import { Tag } from './tags/tag.entity';
import { SoundcloudInterfaceModule } from './soundcloud-interface/scinterface.module';
import { ArtistModule } from './artists/artist.module';
import { TrackModule } from './tracks/track.module';
import { TagModule } from './tags/tag.module';
import { LocalFilesInterfaceModule } from './localfiles-interface/lfinterface.module';
import { TrackSourceModule } from './tracksources/tracksource.module';

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
    ArtistModule,
    TrackModule,
    TagModule,
    LocalFilesInterfaceModule,
    TrackSourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
