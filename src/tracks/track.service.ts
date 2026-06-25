import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackService {
  getTrack(): string {
    return 'Get track hit';
  }
}
