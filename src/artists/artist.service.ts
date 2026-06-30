import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Artist } from './artist.entity';
import { CreateArtistDto, UpdateArtistDto } from './artist.dto';
import { Track } from '../tracks/track.entity';

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
  ): Promise<Artist[]> {
    return await this.artistRepo.find({
      take: limit,
      order: { name: sort ?? 'ASC' },
      relations: { tracks: true },
      where: search ? { name: ILike(`%${search}%`) } : {},
    });
  }

  async getOrCreateArtist(artistObject: CreateArtistDto): Promise<Artist> {
    let artist: Artist | null;
    artist = await this.artistRepo.findOneBy({ name: artistObject.name });
    if (!artist) {
      artist = await this.artistRepo.save(artistObject);
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
    const artist = await this.artistRepo.findOneBy({ id });

    if (!artist) {
      return null;
    }

    const { trackIds, ...rest } = artistDto;
    Object.assign(artist, rest);

    if (trackIds !== undefined) {
      artist.tracks = await this.trackRepo.findBy({ id: In(trackIds) });
    }

    return this.artistRepo.save(artist);
  }
}
