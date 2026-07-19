import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @HttpCode(200)
  @Get('generate')
  async generate(@Body() playlist: any): Promise<string[]> {
    const tracks = await this.playlistService.generatePlaylist();
    return tracks.map(
      (it) => it.fileName?.slice(it.fileName.lastIndexOf('/') + 1) || '',
    );
  }
}
