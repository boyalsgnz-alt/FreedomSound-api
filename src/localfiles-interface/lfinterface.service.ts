import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs';
import { execFile } from 'child_process';
import { TrackService } from '../tracks/track.service';
import * as NodeID3 from 'node-id3';
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

  /**
   * Reads the ID3 tags of the song to extract the duration
   * @param filePath - the path to the file to read ID3 tags from
   */
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

  /**
   * Adds local files to the DB. Either create them entirely or link them
   * @param files - an array of objects containing the ID and filename of the track
   */
  async addLocalFiles(
    files: { id: string; fileName: string }[],
  ): Promise<void> {
    const folderPath =
      this.configService.getOrThrow<string>('LOCAL_FILES_FOLDER');
    for (const file of files) {
      // if the track is a local one, we skip the loop
      const trackEntity = await this.trackService.getByFileName(file.fileName);
      if (trackEntity) {
        continue;
      }
      const trackSource = await this.trackSourceService.getByScId(file.id);
      // if the song doesn't exist in DB, we create it
      if (!trackSource) {
        const tags = NodeID3.read(`${folderPath}/${file.fileName}`);
        const { title, artist, genre } = tags;
        const duration = await this.getMp3Duration(
          `${folderPath}/${file.fileName}`,
        );

        const tagName = genre || '';
        const tagEntity = await this.tagService.getOrCreateTag({
          name: tagName,
          user_vetted: false,
          tracks: [],
        });
        const artistName = artist || '';
        const artistEntity = await this.artistService.getOrCreateArtist({
          name: artistName,
          user_vetted: false,
          tracks: [],
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
        // else we only link the local mp3 to the entry in db
      } else {
        const track = await this.trackService.getById(trackSource.track.id);
        track!.fileName = file.fileName;
        await this.trackRepo.save(track!);
      }
    }
  }

  /**
   * Extracts the ID of the song (SC) present in the filename
   *
   * @param files - a string[] of the file name
   * @returns an array of object containing the file path and the extracted ID
   */
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

  /**
   * Reads the dir defined via env var and gets all mp3 files
   * @returns a string[] containing the file names
   */
  loadAllFiles(): string[] {
    const folderPath =
      this.configService.getOrThrow<string>('LOCAL_FILES_FOLDER');
    const files = fs.readdirSync(folderPath)
      .filter((fileName) => fileName.endsWith('.mp3'));
    return files;
  }
}
