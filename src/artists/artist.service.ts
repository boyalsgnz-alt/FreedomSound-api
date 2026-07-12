import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Artist } from './artist.entity';
import { CreateArtistDto, UpdateArtistDto } from './artist.dto';
import { Track } from '../tracks/track.entity';
import NodeID3 from 'node-id3';

@Injectable()
export class ArtistService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  async getAllArtists(
    limit: number | undefined,
    sort: 'ASC' | 'DESC' | undefined,
    search: string | undefined,
    user_vetted: boolean | undefined,
  ): Promise<Artist[]> {
    return await this.artistRepo.find({
      where: { user_vetted, ...(search ? { name: ILike(`%${search}%`) } : {}) },
      take: limit,
      order: { name: sort ?? 'ASC' },
      relations: { tracks: true },
    });
  }

  async getOrCreateArtist(artistDto: CreateArtistDto): Promise<Artist> {
    let artist: Artist | null;
    artist = await this.artistRepo.findOneBy({ name: artistDto.name });
    if (!artist) {
      artist = await this.artistRepo.save({
        name: artistDto.name,
        user_vetted: artistDto.user_vetted,
        tracks: [],
      });
    }
    return artist;
  }

  async getById(id: number): Promise<Artist | null> {
    return await this.artistRepo.findOneBy({ id });
  }

  async deleteArtistById(id: number): Promise<boolean> {
    const artist = await this.artistRepo.findOne({
      where: { id },
      relations: { tracks: true },
    });
    if (artist) {
      artist.tracks = [];
      await this.artistRepo.save(artist);
      await this.artistRepo.delete(artist);
      return true;
    }
    return false;
  }

  async patchArtistById(
    id: number,
    artistDto: UpdateArtistDto,
  ): Promise<Artist | null> {
    let artist = await this.artistRepo.findOneBy({ id });

    if (!artist) {
      return null;
    }

    const { tracks, ...rest } = artistDto;
    Object.assign(artist, rest);

    if (tracks !== undefined) {
      artist.tracks = await this.trackRepo.findBy({ id: In(tracks) });
    }

    artist = await this.artistRepo.save(artist);

    return artist;
  }

  async decoupleArtists(id: number): Promise<boolean> {
    const artist = await this.artistRepo.findOne({
      where: { id },
      relations: { tracks: true },
    });

    if (!artist) {
      return false;
    }

    const regex = new RegExp(
      /\s*(?:\bx\b|&|\bfeaturing\b|\bfeat\.|\bfeat\b|\bft\.|\bft\b|,)\s*/i,
    );
    // retrieving tracks linked to the current artist
    const tracks: Track[] = [];
    if (artist.tracks.length > 0) {
      for (const track of artist.tracks) {
        const trackEntity = await this.trackRepo.findOne({
          where: { id: track.id },
          relations: { artists: true },
        });
        if (trackEntity) {
          tracks.push(trackEntity);
        }
      }
    }
    // split the current artist, getting/creating them
    const artistsSplit = artist.name.split(regex);
    const newArtists: Artist[] = [];
    for (const artistName of artistsSplit) {
      const artEntity = await this.getOrCreateArtist({
        name: artistName,
        user_vetted: false,
        tracks: [],
      });
      newArtists.push(artEntity);
    }

    // for each track we de-link the current artist and we re-link the created ones
    for (const track of tracks) {
      track.artists = track.artists.filter((it) => it.id !== artist.id);
      for (const artist of newArtists) {
        track.artists.push(artist);
      }
      await this.trackRepo.save(track);
    }

    // finally, we clean up the linking table and we delete the current artist
    artist.tracks = [];
    await this.artistRepo.save(artist);
    await this.artistRepo.delete(artist);
    return true;
  }

  /**
   * This function synchronizes the artists written in the DB with the actual ID3 metadata
   * of songs.
   * Since the DB is the source of truth, we modify the artists on the UI but we have to sync
   * since the iOS app reads the metadata of the file to determine the artists.
   *
   * The downside of this is we have to re-sync all the songs to the device manually, also taking time
   */

  // TODO: This is very heavy, use promises version of ID3 and return immediately
  // TODO: Update the client via Sockets ?
  // TODO: Add a mechanism to know if this has been synchronized, to reduce read/write ops and thus time

  async synchronizeArtists(): Promise<boolean> {
    const tracks = await this.trackRepo.find({ relations: { artists: true } });
    for (const track of tracks) {
      if (!track.fileName) {
        continue;
      }
      const folderPath =
        this.configService.getOrThrow<string>('LOCAL_FILES_FOLDER');
      let tags = NodeID3.read(`${folderPath}/${track.fileName}`);
      const artistsReduced = track.artists.reduce((initial, acc) => {
        return `${initial}, ${acc.name}`;
      }, '');
      tags = { ...tags, artist: artistsReduced };
      NodeID3.update(tags, `${folderPath}/${track.fileName}`);
    }
    return true;
  }
}
