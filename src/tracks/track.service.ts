import { Injectable } from '@nestjs/common';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
  ) {}

  async getById(id: number): Promise<Track | null> {
    return await this.trackRepo.findOne({
      where: { id: id },
      relations: { artists: true, tags: true },
    });
  }

  async getAll(
    limit: number | undefined,
    sort: 'ASC' | 'DESC' | undefined,
    user_vetted: boolean | undefined,
    search: string | undefined,
  ): Promise<Track[]> {
    return await this.trackRepo.find({
      where: {
        user_vetted: user_vetted,
        ...(search && { title: ILike(`%${search}%`) }),
      },
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
