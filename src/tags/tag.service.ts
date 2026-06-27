import { Injectable } from '@nestjs/common';
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

  async getOrCreateTag(tagDto: Partial<Tag>): Promise<Tag> {
    let tag: Tag | null;
    tag = await this.tagRepo.findOneBy({ name: tagDto.name });
    if (!tag) {
      tag = await this.tagRepo.save(tagDto);
    }
    return tag;
  }

  async removeTag(id: number): Promise<boolean> {
    const tag = await this.tagRepo.findOne({
      where: { id },
      relations: { tracks: true },
    });
    if (tag) {
      tag.tracks = [];
      await this.tagRepo.save(tag);
      await this.tagRepo.remove(tag);
      return true;
    }
    return false;
  }

  async updateTag(id: number, tagDto: Partial<Tag>): Promise<Tag | null> {
    let tag = await this.tagRepo.findOneBy({ id: id });
    if (tag) {
      tag = { ...tag, ...tagDto };
      await this.tagRepo.save(tag);
    }
    return tag;
  }
}
