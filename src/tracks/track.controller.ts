import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { Track } from './track.entity';
import { UpdateTrackDto } from './track.dto';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  async getAllTracks(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
    @Query('user_vetted') user_vetted: string | undefined,
    @Query('search') search: string | undefined,
  ): Promise<Track[]> {
    let userVettedBool = false;
    if (user_vetted && user_vetted === 'true') {
      userVettedBool = true;
    }
    return await this.trackService.getAll(limit, sort, userVettedBool, search);
  }

  @Get(':id')
  async getTrackById(@Param() params: { id: number }): Promise<Track | string> {
    const track = await this.trackService.getById(params.id);
    if (!track) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return track;
  }

  @Patch(':id')
  async patchTrackById(
    @Param() params: { id: number },
    @Body() body: UpdateTrackDto,
  ): Promise<boolean> {
    const check = await this.trackService.updateTrack(params.id, body);
    if (!check) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}
