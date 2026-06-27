import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackSource } from './tracksource.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TrackSourceService {
  constructor(
    @InjectRepository(TrackSource)
    private trackSourceRepo: Repository<TrackSource>,
  ) {}

  async getByScId(id: string): Promise<TrackSource | null> {
    return await this.trackSourceRepo.findOne({
      where: { externalId: id },
      relations: { track: true },
    });
  }
}
