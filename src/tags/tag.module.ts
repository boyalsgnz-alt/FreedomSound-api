import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { Tag } from './tag.entity';
import { Track } from '../tracks/track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Track])],
  providers: [TagService],
  controllers: [TagController],
})
export class TagModule {}
