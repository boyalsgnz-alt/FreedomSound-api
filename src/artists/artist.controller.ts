import { Controller, Get, Param, Query } from '@nestjs/common';
import { Artist } from './artist.entity';
import { ArtistService } from './artist.service';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get()
  async getAllArtists(
    @Query('limit') limit: number | undefined,
    @Query('sort') sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Artist[]> {
    return await this.artistService.getAllArtists(limit, sort);
  }

  @Get(':id')
  async getArtistById(@Param() params: any): Promise<Artist | string> {
    const artist = await this.artistService.getById(params.id);
    return artist ? artist : 'No artist found';
  }
}
