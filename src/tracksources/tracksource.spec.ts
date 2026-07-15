import { Test } from '@nestjs/testing';
import { TrackSourceService } from './tracksource.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Platform, TrackSource } from './tracksource.entity';
import { Repository } from 'typeorm';

const date = new Date();

const mockTrackSource = {
  id: 1,
  track: {
    id: 1,
    title: 'Test track',
    duration: 100,
    addedAt: date,
    artists: [],
    tags: [],
    sources: [],
    user_vetted: false
  },
  platform: 'SOUNDCLOUD' as Platform,
  externalId: '1234',
  url: 'http://test.com'
}

describe('TrackSourceService', () => {
  let trackSourceService: TrackSourceService;
  let trackSourceRepo: Repository<TrackSource>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
        providers: [
          TrackSourceService,
          {
            provide: getRepositoryToken(TrackSource),
            useValue: {
              findOne: jest.fn(),
            },
          },
        ],
      })
      .compile();
    
    trackSourceService = module.get(TrackSourceService);
    trackSourceRepo = module.get(getRepositoryToken(TrackSource));
  });

  describe('getByScId', () => {
    it('should return the source from the ID', async () => {
      jest.spyOn(trackSourceRepo, 'findOne').mockResolvedValueOnce(mockTrackSource);

      const result = await trackSourceService.getByScId('1');

      expect(result).toEqual(mockTrackSource);
    });
  })
})