import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';
import { PlaylistOptionsDto } from './playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  async generatePlaylist(dto: PlaylistOptionsDto): Promise<Track[]> {
    const qb = this.trackRepo
      .createQueryBuilder('track')
      .select(['track.fileName', 'track.id']);

    let needsGroupBy = false;

    if (dto.onlyAvailableTracks) {
      qb.where('track.fileName != ""')
    }

    if (dto.tags?.length) {
      qb.innerJoin('track.tags', 'tag', 'tag.id IN (:...tagIds)', {
        tagIds: dto.tags,
      });
      if (dto.matchAllTags) needsGroupBy = true;
    }

    if (dto.artists?.length) {
      qb.innerJoin('track.artists', 'artist', 'artist.id IN (:...artistIds)', {
        artistIds: dto.artists,
      });
      if (dto.matchAllArtists) needsGroupBy = true;
    }

    if (needsGroupBy) {
      qb.groupBy('track.id').addGroupBy('track.fileName');

      if (dto.tags?.length && dto.matchAllTags) {
        qb.andHaving('COUNT(DISTINCT tag.id) = :tagCount', {
          tagCount: dto.tags.length,
        });
      }
      if (dto.artists?.length && dto.matchAllArtists) {
        qb.andHaving('COUNT(DISTINCT artist.id) = :artistCount', {
          artistCount: dto.artists.length,
        });
      }
    } else {
      qb.distinct(true);
    }

    qb.orderBy('RAND()')

    if (dto.limit) {
      qb.limit(dto.limit);
    }

    const tracks = await qb.getMany();
    return tracks;
  }
}
