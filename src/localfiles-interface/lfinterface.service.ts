import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'child_process';
import { TrackService } from '../tracks/track.service';
import NodeID3 from 'node-id3';
import { TrackSourceService } from '../tracksources/tracksource.service';
import { ArtistService } from '../artists/artist.service';
import { TagService } from '../tags/tag.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';
import { Platform, TrackSource } from '../tracksources/tracksource.entity';

@Injectable()
export class LocalFilesInterfaceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly trackSourceService: TrackSourceService,
    private readonly trackService: TrackService,
    private readonly artistService: ArtistService,
    private readonly tagService: TagService,
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    @InjectRepository(TrackSource)
    private trackSourceRepo: Repository<TrackSource>,
  ) {}

  async getMp3Duration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      execFile(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'csv=p=0',
          filePath,
        ],
        (error, stdout) => {
          if (error) return reject(error);
          resolve(parseInt(stdout, 10));
        },
      );
    });
  }

  async addLocalFiles(
    files: { id: string; fileName: string }[],
  ): Promise<void> {
    for (const file of files) {
      const trackEntity = await this.trackService.getByFileName(file.fileName);
      if (trackEntity) {
        continue;
      }
      const trackSource = await this.trackSourceService.getByScId(file.id);
      if (!trackSource) {
        const tags = NodeID3.read(file.fileName);
        const { title, artist, genre } = tags;
        const duration = await this.getMp3Duration(file.fileName);

        const tagName = genre || '';
        const tagEntity = await this.tagService.getOrCreateTag({
          name: tagName,
        });
        const artistEntity = await this.artistService.getOrCreateArtist({
          name: artist,
        });
        let track = this.trackRepo.create({
          title,
          duration,
          fileName: file.fileName,
          artists: [artistEntity],
          tags: [tagEntity],
        });
        track = await this.trackRepo.save(track);

        await this.trackSourceRepo.upsert(
          {
            track,
            platform: Platform.LOCAL,
          },
          ['platform'],
        );
      } else {
        const track = await this.trackService.getById(trackSource.track.id);
        track!.fileName = file.fileName;
        await this.trackRepo.save(track!);
      }
    }
  }

  mapFileToId(files: string[]): { id: string; fileName: string }[] {
    return files.map((it) => {
      if (it.lastIndexOf('[') === -1) {
        return {
          id: '',
          fileName: it,
        };
      }
      return {
        id: it.slice(it.lastIndexOf('[') + 1, it.lastIndexOf(']')),
        fileName: it,
      };
    });
  }

  loadAllFiles(): string[] {
    const folderPath =
      this.configService.getOrThrow<string>('LOCAL_FILES_FOLDER');
    const files = fs
      .readdirSync(folderPath)
      .map((fileName) => {
        if (fileName.endsWith('.mp3')) {
          return path.join(folderPath, fileName);
        }
        return '/Users';
      })
      .filter((file) => fs.lstatSync(file).isFile());
    return files;
  }
}
