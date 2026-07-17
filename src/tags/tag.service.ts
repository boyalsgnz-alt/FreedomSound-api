import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
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
    limit?: number | undefined,
    sort?: 'ASC' | 'DESC' | undefined,
    search?: string | undefined,
    user_vetted?: boolean | undefined,
  ): Promise<Tag[]> {
    return await this.tagRepo.find({
      where: {
        ...(user_vetted ? {user_vetted} : {}),
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      ...(limit ? {take: limit}: {}),
      ...(sort ? {order: {name: sort}}: {}),
      relations: {
        tracks: {
          artists: true,
        },
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
      tag = await this.tagRepo.save({
        name: tagDto.name,
        user_vetted: tagDto.user_vetted,
        tracks: [],
      });
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
    let tag = await this.tagRepo.findOneBy({ id });

    if (!tag) {
      return null;
    }

    const { tracks, ...rest } = tagDto;
    Object.assign(tag, rest);

    if (tracks !== undefined) {
      tag.tracks = await this.trackRepo.findBy({ id: In(tracks) });
    }

    tag = await this.tagRepo.save(tag);
    return tag;
  }
}
