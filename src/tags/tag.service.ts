import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto, UpdateTagDto } from './tag.dto';
import { Track } from '../tracks/track.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
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

  async getOrCreateTag(tagDto: CreateTagDto): Promise<Tag> {
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

  async updateTag(id: number, tagDto: UpdateTagDto): Promise<Tag | null> {
    const tag = await this.tagRepo.findOneBy({ id });

    if (!tag) {
      return null;
    }

    const { trackIds, ...rest } = tagDto;
    Object.assign(tag, rest);

    if (trackIds !== undefined) {
      tag.tracks = await this.trackRepo.findBy({ id: In(trackIds) });
    }

    return this.tagRepo.save(tag);
  }
}
