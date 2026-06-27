import { Module } from '@nestjs/common';
import { LocalFilesInterfaceService } from './lfinterface.service';
import { LocalFilesInterfaceController } from './lfinterface.controller';
import { ConfigModule } from '@nestjs/config';
import { TrackService } from '../tracks/track.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Tag } from '../tags/tag.entity';
import { TrackSource } from '../tracksources/tracksource.entity';
import { Artist } from '../artists/artist.entity';
import { ArtistService } from '../artists/artist.service';
import { TagService } from '../tags/tag.service';
import { TrackSourceService } from '../tracksources/tracksource.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Track, Tag, TrackSource, Artist]),
  ],
  providers: [
    LocalFilesInterfaceService,
    TrackService,
    ArtistService,
    TagService,
    TrackSourceService,
  ],
  controllers: [LocalFilesInterfaceController],
})
export class LocalFilesInterfaceModule {}
