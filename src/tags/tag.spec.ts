import { TagService } from './tag.service';
import { ILike, Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrackService } from '../tracks/track.service';
import { Track } from '../tracks/track.entity';

const mockTag = {
  id: 1,
  name: 'rock',
  user_vetted: false,
  tracks: [],
};

describe('TagService', () => {
  let tagService: TagService;
  let tagRepo: Repository<Tag>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Track),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    tagService = module.get(TagService);
    tagRepo = module.get(getRepositoryToken(Tag));
    jest.resetAllMocks();
  });

  describe('getAllTags', () => {
    it.each([
      {
        params: {
          limit: undefined,
          sort: undefined,
          search: undefined,
          user_vetted: undefined,
        },
        expected: {
          where: {},
          relations: {
            tracks: {
              artists: true,
            },
          },
        },
      },
      {
        params: {
          limit: undefined,
          sort: 'DESC' as const,
          search: undefined,
          user_vetted: undefined,
        },
        expected: {
          where: {},
          order: { name: 'DESC' },
          relations: {
            tracks: {
              artists: true,
            },
          },
        },
      },
      {
        params: {
          limit: undefined,
          sort: undefined,
          search: 'rock',
          user_vetted: true,
        },
        expected: {
          where: { user_vetted: true, name: ILike('%rock%') },
          relations: {
            tracks: {
              artists: true,
            },
          },
        },
      },
      {
        params: {
          limit: 10,
          sort: undefined,
          search: undefined,
          user_vetted: undefined,
        },
        expected: {
          where: {},
          take: 10,
          relations: {
            tracks: {
              artists: true,
            },
          },
        },
      },
    ])(
      'does the right request depending on params',
      async ({ params, expected }) => {
        await tagService.getAllTags(
          params.limit,
          params.sort,
          params.search,
          params.user_vetted,
        );
        expect(tagRepo.find).toHaveBeenCalledWith(expected);
      },
    );
  });

  describe('getTagById', () => {
    it('should return the tag defined by ID', async () => {
      jest.spyOn(tagRepo, 'findOneBy').mockResolvedValueOnce(mockTag);

      const result = await tagService.getById(1);
      expect(tagRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(mockTag);
    });
  });

  describe('getOrCreateTag', () => {
    it('should return the tag found', async () => {
      jest.spyOn(tagRepo, 'findOneBy').mockResolvedValueOnce(mockTag);

      const result = await tagService.getOrCreateTag(mockTag);
      expect(tagRepo.findOneBy).toHaveBeenCalledWith({ name: 'rock' });
      expect(tagRepo.save).not.toHaveBeenCalled();
      expect(result).toBe(mockTag);
    });

    it('should create the tag and return it', async () => {
      jest.spyOn(tagRepo, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(tagRepo, 'save').mockResolvedValueOnce(mockTag);

      const result = await tagService.getOrCreateTag(mockTag);
      expect(tagRepo.findOneBy).toHaveBeenCalledWith({ name: 'rock' });
      expect(tagRepo.save).toHaveBeenCalled();
      expect(result).toBe(mockTag);
    });
  });

  describe('removeTag', () => {
    it('should remove the tag identified', async () => {
      jest.spyOn(tagRepo, 'findOne').mockResolvedValueOnce(mockTag);

      const result = await tagService.removeTag(1);
      expect(tagRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { tracks: true },
      });
      expect(tagRepo.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if tag not found', async () => {
      jest.spyOn(tagRepo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(tagRepo, 'save').mockResolvedValueOnce(mockTag);

      const result = await tagService.removeTag(1);
      expect(tagRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { tracks: true },
      });
      expect(tagRepo.save).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('updateTag', () => {
    it('should return null if tag is not found', async () => {
      jest.spyOn(tagRepo, 'findOneBy').mockResolvedValueOnce(null);

      const result = await tagService.updateTag(1, {name: 'test', user_vetted: false});
      expect(tagRepo.findOneBy).toHaveBeenCalledWith({id: 1});
      expect(tagRepo.save).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('should return false if tag not found', async () => {
      jest.spyOn(tagRepo, 'findOneBy').mockResolvedValueOnce(mockTag);
      jest.spyOn(tagRepo, 'save').mockResolvedValueOnce(mockTag);

      const result = await tagService.updateTag(1, {
        name: 'test',
        user_vetted: false,
      });
      expect(tagRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });

      expect(tagRepo.save).toHaveBeenCalled();
      expect(result).toEqual({...mockTag, name: 'test'});
    });
  });
});
