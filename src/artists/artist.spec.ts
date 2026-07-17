import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ArtistService } from './artist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Track } from '../tracks/track.entity';
import { Artist } from './artist.entity';
import { Repository } from 'typeorm';
import NodeID3 from 'node-id3';

jest.mock('node-id3');

const mockArtists = [
  { id: 1, name: 'Virtual Riot', user_vetted: false, tracks: [] },
  { id: 2, name: 'Infowler', user_vetted: false, tracks: [] },
];

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

const mockDecoupleArtist = {
  id: 1,
  name: 'Virtual Riot x Skrillex ft. Froej',
  user_vetted: false,
  tracks: [mockTrack],
};

describe('ArtistsService', () => {
  let artistService: ArtistService;
  let artistRepo: Repository<Artist>;
  let trackRepo: Repository<Track>;
  let configService: ConfigService;

  beforeEach(async () => {

    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        ArtistService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation(() => ('/some/path'))
          }
        },
        {
          provide: getRepositoryToken(Track),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            findBy: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          }
        },
        {
          provide: getRepositoryToken(Artist),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          }
        }
      ]
    }).compile();

    artistRepo = module.get(getRepositoryToken(Artist));
    trackRepo = module.get(getRepositoryToken(Track));
    artistService = module.get(ArtistService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  describe('getAllArtists', () => {
    it('should return all artists in db', async () => {
      jest.spyOn(artistRepo, 'find').mockResolvedValueOnce(mockArtists);
      const res = await artistService.getAllArtists(2, "DESC", "", false);
      expect(res).toEqual(mockArtists);
      expect(artistRepo.find).toHaveBeenCalled();
    })
  });

  describe('getById', () => {
    it('should return the artist defined by the id', async () => {
      jest.spyOn(artistRepo, 'findOneBy').mockResolvedValueOnce(mockArtists[0]);
      const res = await artistService.getById(1);
      expect(res).toEqual(mockArtists[0]);
      expect(artistRepo.findOneBy).toHaveBeenCalled();
    });
  });

  describe('deleteArtistById', () => {
    it('should delete the artist defined by the id', async () => {
      jest.spyOn(artistRepo, 'findOne').mockResolvedValueOnce(mockArtists[0]);
      jest.spyOn(artistRepo, 'save').mockResolvedValueOnce(mockArtists[0]);
      const res = await artistService.deleteArtistById(1);
      expect(res).toBe(true);
      expect(artistRepo.findOne).toHaveBeenCalled();
    });

    it('should return false if the artist was not found', async () => {
      const res = await artistService.deleteArtistById(1);
      expect(res).toBe(false);
      expect(artistRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('patchArtistById', () => {
    it('should patch the artist and return the patched version', async () => {
      jest.spyOn(artistRepo, 'findOneBy').mockResolvedValueOnce(mockArtists[0]);
      jest.spyOn(trackRepo, 'findBy').mockResolvedValue([mockTrack]);
      jest
        .spyOn(artistRepo, 'save')
        .mockResolvedValueOnce({
          ...mockArtists[0],
          name: 'Riot Virtual',
          tracks: [mockTrack],
        });
      const res = await artistService.patchArtistById(1, {name: 'Riot Virtual', user_vetted: false, tracks: [1]});
      expect(res).toEqual({...mockArtists[0], name: 'Riot Virtual', tracks: [mockTrack]});
      expect(trackRepo.findBy).toHaveBeenCalled();
      expect(artistRepo.save).toHaveBeenCalled();
    });

    it('should return null if the artist was not found', async () => {
      jest.spyOn(artistRepo, 'findOneBy').mockResolvedValueOnce(null);
      const res = await artistService.patchArtistById(1, {
        name: 'Riot Virtual',
        user_vetted: false,
        tracks: [1],
      });
      expect(res).toBe(null);
    });
  });

  describe('decoupleArtists', () => {
    it('should split artists found from ID by a specific regex and make changes accordingly', async () => {
      jest.spyOn(artistRepo, 'findOne').mockResolvedValueOnce(mockDecoupleArtist);
      jest.spyOn(trackRepo, 'findOne').mockResolvedValue(mockTrack);
      jest.spyOn(artistService, 'getOrCreateArtist').mockResolvedValue({
        id: 1,
        name: 'Test',
        user_vetted: false,
        tracks: [],
      });
      const res = await artistService.decoupleArtists(2);
      expect(trackRepo.save).toHaveBeenCalled();
      expect(artistRepo.delete).toHaveBeenCalled();
    });

    it('should return null if artist was not found', async () => {
      jest
        .spyOn(artistRepo, 'findOne')
        .mockResolvedValueOnce(null);
      const res = await artistService.decoupleArtists(2);
      expect(res).toBe(false);
    });
  })

  describe('synchronizeArtists', () => {
    it('should update ID3 tags of actual .mp3', async () => {
      jest
        .spyOn(NodeID3, 'read')
        .mockReturnValue({
          artist: 'test',
          title: 'track',
          genre: 'dubstep',
        } as any);
      jest.spyOn(NodeID3, 'update').mockReturnValue({
        artist: 'test',
        title: 'track',
        genre: 'dubstep',
      } as any);
      jest.spyOn(trackRepo, 'find').mockResolvedValueOnce([
        { ...mockTrack, artists: mockArtists },
        { ...mockTrack, artists: mockArtists, fileName: undefined },
      ]);

      const res = await artistService.synchronizeArtists();
      expect(res).toBe(true);
      expect(NodeID3.update).toHaveBeenCalledTimes(1);
    });
  })
});