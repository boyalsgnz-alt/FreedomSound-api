import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
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

  @Patch('')
  async patchTracks(@Body() body: UpdateTrackDto[]): Promise<boolean> {
    const check = await this.trackService.updateTracks(body);
    if (!check) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  @Get()
  async getAllTracks(
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
    @Query('user_vetted') user_vetted: string | undefined,
    @Query('search') search: string | undefined,
  ): Promise<ResponseTrackDto[]> {
    const res = await this.trackService.getAll(
      limit,
      sort,
      user_vetted,
      search,
    );
    return plainToInstance(ResponseTrackDto, res);
  }

  @Get(':id')
  async getTrackById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Track | string> {
    const track = await this.trackService.getById(id);
    if (!track) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return track;
  }

  @Patch(':id')
  async patchTrackById(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTrackDto,
  ): Promise<boolean> {
    const check = await this.trackService.updateTrack(id, body);
    if (!check) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}
