import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistOptionsDto } from './playlist.dto';

@Controller('playlists')
export class PlaylistController {
  private readonly logger = new Logger(PlaylistController.name);

  constructor(private readonly playlistService: PlaylistService) {}

  @HttpCode(200)
  @Post('generate')
  async generate(@Body() optionsDto: PlaylistOptionsDto): Promise<string[]> {
    try {
      const tracks = await this.playlistService.generatePlaylist(optionsDto);
      return tracks.map(
        (it) => it.fileName?.slice(it.fileName.lastIndexOf('/') + 1) || '',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Failed to generate playlist',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to generate playlist');
    }
  }

  @Get('/playground')
  async playground(): Promise<string[]> {
    const tracks = await this.playlistService.playground();
    return tracks.map((it) => {
      if (it.fileName)
        return encodeURI(it.fileName?.slice(it.fileName.lastIndexOf('/') + 1));
      return '';
    });
  }
}
