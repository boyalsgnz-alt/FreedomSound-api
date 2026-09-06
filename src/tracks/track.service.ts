import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Track } from './track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { UpdateTrackDto } from './track.dto';
import { Artist } from '../artists/artist.entity';
import { Tag } from '../tags/tag.entity';
import NodeID3 from 'node-id3';

@Injectable()
export class TrackService {
  constructor(
    private readonly configService: ConfigService,
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
    let userVetted: boolean | null = null;
    if (user_vetted === 'false' || user_vetted === 'true') {
      userVetted = JSON.parse(user_vetted.toLowerCase());
    }
    return await this.trackRepo.find({
      where: {
        ...(userVetted !== null ? { user_vetted: userVetted } : {}),
        ...(search && { title: ILike(`%${search}%`) }),
      },
      ...(limit ? { take: limit } : {}),
      ...(sort ? { order: { title: sort } } : {}),
      relations: { artists: true, tags: true },
    });
  }

  /**
   * Function to retrieve a track by its filename. Returns null if track has not been found
   */
  async getByFileName(fileName: string): Promise<Track | null> {
    return await this.trackRepo.findOne({
      where: { fileName },
      relations: { artists: true, tags: true },
    });
  }

  /**
   * Function to convert a track DTO to a track Entity.
   *
   * This function also puts the "user_vetted" flag of all the related Tags and Artists to true
   * @param entity The Entity to modify
   * @param dto The DTO received from external source
   */
  async mapTrackDtoToEntity(
    entity: Track,
    dto: UpdateTrackDto,
  ): Promise<boolean> {
    if (dto.user_vetted !== undefined) entity.user_vetted = dto.user_vetted;
    if (dto.fileName) entity.fileName = dto.fileName;
    if (dto.title) entity.title = dto.title;
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
        for (const artEnt of artistEntities) {
          if (!artEnt.user_vetted) {
            artEnt.user_vetted = true;
            await this.artistRepo.save(artEnt);
          }
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
        for (const tagEnt of tagEntities) {
          if (!tagEnt.user_vetted) {
            tagEnt.user_vetted = true;
            await this.tagRepo.save(tagEnt);
          }
        }
        entity.tags = tagEntities;
      }
    }
    if (
      entity.fileName &&
      (dto.title || dto.artists !== undefined || dto.tags !== undefined)
    ) {
      const folderPath =
        this.configService.getOrThrow<string>('LOCAL_FILES_FOLDER');
      const filePath = `${folderPath}/${entity.fileName}`;
      const existingTags = NodeID3.read(filePath);
      NodeID3.update(
        {
          ...existingTags,
          ...(dto.title ? { title: dto.title } : {}),
          ...(dto.artists !== undefined
            ? { artist: entity.artists.map((a) => a.name).join(', ') }
            : {}),
          ...(dto.tags !== undefined
            ? { genre: entity.tags.map((t) => t.name).join(', ') }
            : {}),
        },
        filePath,
      );
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

  async updateTracks(dtos: UpdateTrackDto[]): Promise<boolean> {
    for (const trackObj of dtos) {
      if (!trackObj.id) {
        continue;
      }
      const track = await this.getById(trackObj.id);
      if (!track) {
        continue;
      }
      await this.mapTrackDtoToEntity(track, trackObj);
    }
    return true;
  }
}
