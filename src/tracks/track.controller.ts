import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query, UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { Track } from './track.entity';
import { ResponseTrackDto, UpdateTrackDto } from './track.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';

@UseInterceptors(ResponseInterceptor)
@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  async getAllTracks(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
    @Query('user_vetted') user_vetted: string | undefined,
    @Query('search') search: string | undefined,
  ): Promise<ResponseTrackDto[]> {
    let userVettedBool = false;
    if (user_vetted && user_vetted === 'true') {
      userVettedBool = true;
    }
    const res = await this.trackService.getAll(
      limit,
      sort,
      userVettedBool,
      search,
    );
    return plainToInstance(ResponseTrackDto, res);
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
