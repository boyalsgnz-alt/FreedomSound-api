import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('tracks')
  async getTrackStats() {
    return this.statsService.getTrackStats();
  }

  @Get('artists')
  async getArtistStats() {
    return this.statsService.getArtistStats();
  }

  @Get('tags')
  async getTagStats() {
    return this.statsService.getTagStats();
  }

  @Get('all')
  async getAllStats() {
    const tagStats = await this.getTagStats();
    const artistStats = await this.getArtistStats();
    const trackStats = await this.getTrackStats();

    return {
      tags: tagStats,
      artists: artistStats,
      tracks: trackStats,
    };
  }
}
