import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  async generatePlaylist(): Promise<Track[]> {
    const tracks = await this.trackRepo
      .createQueryBuilder('track')
      .innerJoin('track.tags', 'tag')
      .where('tag.name = :name', { name: 'dubstep' })
      .andWhere('track.fileName != ""')
      .select(['track.fileName', 'track.id'])
      .orderBy('RAND()')
      .limit(10)
      .getMany();

    return tracks;
  }
}
