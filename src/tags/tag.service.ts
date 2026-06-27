import { Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async getAllTags(
    limit: number | undefined,
    sort: 'ASC' | 'DESC' | undefined,
  ): Promise<Tag[]> {
    return await this.tagRepo.find({
      take: limit,
      order: {
        name: sort,
      },
    });
  }

  async getById(id: number): Promise<Tag | null> {
    return await this.tagRepo.findOneBy({ id: id });
  }
}
