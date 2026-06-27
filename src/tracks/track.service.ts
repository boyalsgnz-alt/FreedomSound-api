import { Injectable } from '@nestjs/common';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  async getById(id: number): Promise<Track | null> {
    return await this.trackRepo.findOneBy({ id: id });
  }

  async getAll(
    limit: number | undefined,
    sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Track[]> {
    return await this.trackRepo.find({
      take: limit,
      order: {
        title: sort,
      },
      relations: { artists: true, tags: true },
    });
  }

  async getByFileName(fileName: string): Promise<Track | null> {
    return await this.trackRepo.findOneBy({ fileName });
  }
}
