import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { Artist } from '../artists/artist.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Track) private trackRepo: Repository<Track>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(Artist) private artistRepo: Repository<Artist>,
  ) {}

  async getTrackStats() {
    const [total, vetted, missingFiles] = await Promise.all([
      this.trackRepo.count(),
      this.trackRepo.count({ where: { user_vetted: true } }),
      this.trackRepo.count({ where: { fileName: '' } }),
    ]);
    return { missingFiles, vetted, total };
  }

  async getArtistStats() {
    const [total, vetted] = await Promise.all([
      this.artistRepo.count(),
      this.artistRepo.count({ where: { user_vetted: true } }),
    ]);
    return { vetted, total };
  }

  async getTagStats() {
    const [total, vetted] = await Promise.all([
      this.tagRepo.count(),
      this.tagRepo.count({ where: { user_vetted: true } }),
    ]);
    return { vetted, total };
  }
}
