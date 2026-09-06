import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './track.entity';
import { Artist } from '../artists/artist.entity';
import { Tag } from '../tags/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Artist, Tag])],
  controllers: [TrackController],
  providers: [ConfigService, TrackService],
})
export class TrackModule {}
