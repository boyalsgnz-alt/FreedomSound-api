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
    const tracks = await this.trackRepo.find();
    const stats = { missingFiles: 0, vetted: 0, total: tracks.length };
    let counter = 0;
    while (counter < tracks.length) {
      if (tracks[counter].fileName === '') stats.missingFiles += 1;
      if (tracks[counter].user_vetted) stats.vetted += 1;
      counter += 1;
    }
    return stats;
  }

  async getArtistStats() {
    const artists = await this.artistRepo.find();
    const stats = { vetted: 0, total: artists.length };
    let counter = 0;
    while (counter < artists.length) {
      if (artists[counter].user_vetted) stats.vetted += 1;
      counter += 1;
    }
    return stats;
  }

  async getTagStats() {
    const tags = await this.tagRepo.find();
    const stats = { vetted: 0, total: tags.length };
    let counter = 0;
    while (counter < tags.length) {
      if (tags[counter].user_vetted) stats.vetted += 1;
      counter += 1;
    }
    return stats;
  }
}
