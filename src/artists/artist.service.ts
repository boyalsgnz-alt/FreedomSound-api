import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './artist.entity';

@Injectable()
export class ArtistService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
  ) {}

  async getAllArtists(
    limit: number | undefined,
    sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Artist[]> {
    return await this.artistRepo.find({
      take: limit,
      order: { name: sort ?? 'ASC' },
    });
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
}
