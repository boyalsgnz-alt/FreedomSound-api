import { ILike, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Track } from './track.entity';
import { TrackService } from './track.service';
import { Artist } from '../artists/artist.entity';
import { ArtistModule } from '../artists/artist.module';
import { Tag } from '../tags/tag.entity';

const date = new Date();

const mockTrack = {
  id: 1,
  fileName: 'fake/path.mp3',
  title: 'Test track',
  artists: [],
  tags: [],
  addedAt: date,
  duration: 100,
  sources: [],
  user_vetted: false,
};

describe('TrackService', () => {
  let trackService: TrackService;
  let trackRepo: Repository<Track>;
  let artistRepo: Repository<Artist>;
  let tagRepo: Repository<Tag>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrackService,
        {
          provide: getRepositoryToken(Track),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Artist),
          useValue: {
            find: jest.fn(),
          }
        }
      ],

    }).compile();

    trackService = module.get(TrackService);
    trackRepo = module.get(getRepositoryToken(Track));
    artistRepo = module.get(getRepositoryToken(Artist));
    tagRepo = module.get(getRepositoryToken(Tag));
    jest.resetAllMocks();
  });

  describe('getById', () => {
    it('should return the track found by ID', async () => {
      jest.spyOn(trackRepo, 'findOne').mockResolvedValueOnce(mockTrack);

      const result = await trackService.getById(1);
      expect(trackRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { artists: true, tags: true },
      });
      expect(result).toEqual(mockTrack);
    });
  });

  describe('getAllTracks', () => {
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
            artists: true,
            tags: true,
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
          order: { title: 'DESC' },
          relations: {
            artists: true,
            tags: true,
          },
        },
      },
      {
        params: {
          limit: undefined,
          sort: undefined,
          search: 'Test track',
          user_vetted: true,
        },
        expected: {
          where: { user_vetted: true, title: ILike('%Test track%') },
          relations: {
            artists: true,
            tags: true,
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
            artists: true,
            tags: true,
          },
        },
      },
    ])(
      'does the right request depending on params',
      async ({ params, expected }) => {
        await trackService.getAll(
          params.limit,
          params.sort,
          params.user_vetted,
          params.search,
        );
        expect(trackRepo.find).toHaveBeenCalledWith(expected);
      },
    );
  });

  describe('getByFileName', () => {
    it('should return the track found by filename', async () => {
      jest.spyOn(trackRepo, 'findOne').mockResolvedValueOnce(mockTrack);

      const result = await trackService.getByFileName(mockTrack.fileName);
      expect(trackRepo.findOne).toHaveBeenCalledWith({
        where: { fileName: mockTrack.fileName },
        relations: { artists: true, tags: true },
      });
      expect(result).toEqual(mockTrack);
    });
  });

  describe('updateById', () => {
    it('should update the track found by id', async () => {
      jest.spyOn(trackRepo, 'findOne').mockResolvedValueOnce(mockTrack);
      jest.spyOn(trackRepo, 'save').mockResolvedValueOnce({...mockTrack, title: 'Another title'})

      const result = await trackService.updateTrack(1, {
        ...mockTrack,
        title: 'Another title',
      });
      expect(trackRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockTrack.id },
        relations: { artists: true, tags: true },
      });
      expect(trackRepo.save).toHaveBeenCalledWith({
        ...mockTrack,
        title: 'Another title',
      });
    });

    it('should return false if the track is not found', async () => {
      jest.spyOn(trackRepo, 'findOne').mockResolvedValueOnce(null);

      const result = await trackService.updateTrack(1, {
        ...mockTrack,
        title: 'Another title',
      });
      expect(trackRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockTrack.id },
        relations: { artists: true, tags: true },
      });
      expect(result).toBe(false);
    });

    it.each([
      {
        params: {
          track: { ...mockTrack, artists: [1] },
          returnValue: true,
          mockArtist: [],
          mockTag: [],
          mockTrackFull: mockTrack,
        },
      },
      {
        params: {
          track: { ...mockTrack, tags: [2] },
          returnValue: true,
          mockArtist: [],
          mockTag: [],
          mockTrackFull: mockTrack,
        },
      },
      {
        params: {
          track: { artists: [2], tags: [2] },
          returnValue: true,
          mockArtist: [],
          mockTag: [],
          mockTrackFull: mockTrack,
        },
      },
      {
        params: {
          track: { user_vetted: true, fileName: 'fake/path.mp3', title: 'new title' },
          returnValue: false,
          mockArtist: [],
          mockTag: [],
          mockTrackFull: mockTrack,
        },
      },
      {
        params: {
          track: { ...mockTrack, artists: [1], tags: [1] },
          returnValue: false,
          mockArtist: [
            { id: 1, name: 'test artist', tracks: [], user_vetted: false },
          ],
          mockTag: [
            { id: 1, name: 'test tag', tracks: [], user_vetted: false },
          ],
          mockTrackFull: {
            ...mockTrack,
            artists: [
              { id: 1, name: 'test artist', tracks: [], user_vetted: false },
            ],
            tags: [{ id: 1, name: 'test tag', tracks: [], user_vetted: false }],
          },
        },
      },
    ])(
      'should return false, except for the last 2 tests',
      async ({ params }) => {
        jest
          .spyOn(trackRepo, 'findOne')
          .mockResolvedValueOnce(params.mockTrackFull);
        jest.spyOn(tagRepo, 'find').mockResolvedValueOnce(params.mockTag);
        jest.spyOn(artistRepo, 'find').mockResolvedValueOnce(params.mockArtist);

        const result = await trackService.updateTrack(1, params.track);
        if (params.returnValue) {
          expect(result).toBe(false);
        } else {
          expect(result).toBe(true);
        }
      },
    );
  });
})