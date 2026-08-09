import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Tag } from '../tags/tag.entity';
import { Artist } from '../artists/artist.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Tag, Artist])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
