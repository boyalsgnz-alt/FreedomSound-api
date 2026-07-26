import { Injectable, NotFoundException } from '@nestjs/common';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { UpdateTrackDto } from './track.dto';
import { Artist } from '../artists/artist.entity';
import { Tag } from '../tags/tag.entity';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private trackRepo: Repository<Track>,
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
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
    user_vetted: string | undefined,
    search: string | undefined,
  ): Promise<Track[]> {
    let userVetted = null;
    if (user_vetted === 'false' || user_vetted === 'true') {
      userVetted = JSON.parse(user_vetted.toLowerCase());
    }
    return await this.trackRepo.find({
      where: {
        ...(userVetted ? { user_vetted: userVetted } : {}),
        ...(search && { title: ILike(`%${search}%`) }),
      },
      ...(limit ? { take: limit } : {}),
      ...(sort ? { order: { title: sort } } : {}),
      relations: { artists: true, tags: true },
    });
  }

  async getByFileName(fileName: string): Promise<Track | null> {
    return await this.trackRepo.findOne({
      where: { fileName },
      relations: { artists: true, tags: true },
    });
  }

  async mapTrackDtoToEntity(
    entity: Track,
    dto: UpdateTrackDto,
  ): Promise<boolean> {
    if (dto.user_vetted !== undefined) entity.user_vetted = dto.user_vetted;
    if (dto.title) entity.title = dto.title;
    if (dto.fileName) entity.fileName = dto.fileName;
    if (dto.artists !== undefined) {
      if (dto.artists.length === 0) {
        entity.artists = [];
      } else {
        const artistEntities = await this.artistRepo.find({
          where: { id: In(dto.artists) },
        });
        if (artistEntities.length !== dto.artists.length) {
          return false;
        }
        entity.artists = artistEntities;
      }
    }
    if (dto.tags !== undefined) {
      if (dto.tags.length === 0) {
        entity.tags = [];
      } else {
        const tagEntities = await this.tagRepo.find({
          where: { id: In(dto.tags) },
        });
        if (tagEntities.length !== dto.tags.length) {
          return false;
        }
        entity.tags = tagEntities;
      }
    }
    await this.trackRepo.save(entity);
    return true;
  }

  async updateTrack(id: number, dto: UpdateTrackDto): Promise<boolean> {
    const track = await this.getById(id);
    if (!track) {
      return false;
    }
    return await this.mapTrackDtoToEntity(track, dto);
  }
}
