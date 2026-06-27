import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackSource } from './tracksource.entity';
import { TrackSourceService } from './tracksource.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrackSource])],
  providers: [TrackSourceService],
})
export class TrackSourceModule {}
