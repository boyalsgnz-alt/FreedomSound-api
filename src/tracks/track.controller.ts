import { Controller, Get } from '@nestjs/common';
import { TrackService } from './track.service';

@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  getTrack(): string {
    return this.trackService.getTrack();
  }
}
