import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { Track } from './track.entity';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  async getAllTracks(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Track[]> {
    return await this.trackService.getAll(limit, sort);
  }

  @Get(':id')
  async getTrackById(@Param() params: { id: number }): Promise<Track | string> {
    const track = await this.trackService.getById(params.id);
    if (!track) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return track;
  }
}
