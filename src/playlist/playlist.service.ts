import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';
import { PlaylistOptionsDto } from './playlist.dto';
import { writeFile } from 'fs/promises';
import path from 'node:path';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  private sanitizePlaylistFileName(fileName: string): string {
    const baseName = path.basename(fileName).trim();
    const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!sanitized || sanitized === '.' || sanitized === '..') {
      throw new InternalServerErrorException('Invalid playlist file name');
    }
    return sanitized;
  }

  async generatePlaylist(dto: PlaylistOptionsDto): Promise<Track[]> {
    const qb = this.trackRepo
      .createQueryBuilder('track')
      .select(['track.fileName', 'track.id']);

    let needsGroupBy = false;

    if (dto.onlyAvailableTracks) {
      qb.where('track.fileName != ""');
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

    qb.orderBy('RAND()');

    if (dto.limit) {
      qb.limit(dto.limit);
    }

    const tracks = await qb.getMany();
    if (!dto.generateFile) {
      return tracks;
    }
    const strToWrite = tracks.reduce(
      (acc, curr) => `${acc}\n${encodeURI(curr.fileName!)}`,
      '',
    );
    try {
      const safeRoot = path.resolve('./generate-playlists');
      const safeFileName = this.sanitizePlaylistFileName(dto.fileName);
      const outputPath = path.resolve(safeRoot, `${safeFileName}.m3u`);
      if (!outputPath.startsWith(`${safeRoot}${path.sep}`)) {
        throw new InternalServerErrorException('Invalid output path');
      }
      await writeFile(
        outputPath,
        `#EXTM3U\n#PLAYLIST: ${dto.playlistName}\n${strToWrite}`,
        { flag: 'w+' },
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
    return tracks;
  }

  async playground() {
    const qb = this.trackRepo
      .createQueryBuilder('track')
      .select(['track.fileName', 'track.id']);

    qb.innerJoin('track.artists', 'artist', 'artist.id = 2059');

    const tracks = await qb.getMany();
    return tracks;
  }
}
