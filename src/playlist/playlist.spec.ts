import { PlaylistService } from './playlist.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Repository } from 'typeorm';

const date = new Date();
const mockTrack = {
  id: 1,
  title: 'Track 1',
  artists: [],
  tags: [],
  sources: [],
  addedAt: date,
  duration: 100,
  fileName: '',
};

function createMockQueryBuilder<T>(result: T) {
  return {
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
    getOne: jest.fn().mockResolvedValue(result),
  };
}

describe('PlaylistService', () => {
  let playlistService: PlaylistService;
  let trackRepo: Repository<Track>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlaylistService,
        {
          provide: getRepositoryToken(Track),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    playlistService = module.get(PlaylistService);
    trackRepo = module.get(getRepositoryToken(Track));
  });

  describe('generatePlaylist', () => {
    it('should generate a playlist', async () => {
      const mockQueryBuilder = createMockQueryBuilder([mockTrack, {...mockTrack, title: 'Track 2'}]);
      jest
        .spyOn(trackRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await playlistService.generatePlaylist();
      expect(result).toEqual([mockTrack, { ...mockTrack, title: 'Track 2' }]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('tag.name = :name', {
        name: 'dubstep',
      });
    });
  });
});
