import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocalFilesInterfaceService } from './lfinterface.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import fs from 'node:fs';
import * as process from 'child_process';
import * as NodeID3 from 'node-id3';
import { LocalFilesInterfaceModule } from './lfinterface.module';
import { TrackService } from '../tracks/track.service';
import { TagService } from '../tags/tag.service';
import { ArtistService } from '../artists/artist.service';
import { Track } from '../tracks/track.entity';
import { Platform, TrackSource } from '../tracksources/tracksource.entity';
import { TrackSourceService } from '../tracksources/tracksource.service';
import { Artist } from '../artists/artist.entity';
import { Tag } from '../tags/tag.entity';
import { Repository } from 'typeorm';

jest.mock('child_process');
jest.mock('node-id3');

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

describe('LocalFilesInterfaceService', () => {
  let lfService: LocalFilesInterfaceService;
  let tagService: TagService;
  let artistService: ArtistService;
  let trackService: TrackService;
  let trackSourceService: TrackSourceService;
  let trackRepository: Repository<Track>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        LocalFilesInterfaceService,
        TrackSourceService,
        TrackService,
        TagService,
        ArtistService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest
              .fn()
              .mockImplementation(
                () => '/Users/gaetan/Downloads/Stacher Music',
              ),
          },
        },
        {
          provide: getRepositoryToken(Track),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TrackSource),
          useValue: {
            upsert: jest.fn().mockResolvedValue({id: 1, platform: 'soundcloud', externalId: '1123', url: 'http://test.com'}),
            findOne: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(Artist),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    lfService = module.get(LocalFilesInterfaceService);
    tagService = module.get(TagService);
    artistService = module.get(ArtistService);
    trackService = module.get(TrackService);
    trackSourceService = module.get(TrackSourceService);
    trackRepository = module.get(getRepositoryToken(Track));
  });

  describe('loadAllFiles', () => {
    it('Should return an array of files', () => {
      jest
        .spyOn(fs, 'readdirSync')
        .mockReturnValueOnce(['file1.mp3', 'file2.mp3', 'file3.mp3', 'randomfile.txt']);

      const res = lfService.loadAllFiles();
      expect(res).toEqual(['file1.mp3', 'file2.mp3', 'file3.mp3']);
    });
  });

  describe('mapIdToFile', () => {
    it('should extract the SC id from the filenames, or return an empty string for it if not found', () => {
      const res = lfService.mapFileToId([
        'file1.mp3',
        'file2 [9305719475].mp3',
        'file3 [50105770153].mp3',
      ]);

      expect(res).toEqual([
        { id: '', fileName: 'file1.mp3' },
        { id: '9305719475', fileName: 'file2 [9305719475].mp3' },
        { id: '50105770153', fileName: 'file3 [50105770153].mp3' },
      ]);
    });
  });

  describe('getMp3Duration', () => {
    it('should extract the track duration from headers', async () => {
      jest.spyOn(process, 'execFile').mockImplementation(((
        command: string,
        args: string[],
        callback: Function,
      ) => {
        callback(null, '100', '');
      }) as any);
      const res = await lfService.getMp3Duration('file1.mp3');

      expect(res).toEqual(100);
    })
  })

  describe('addLocalFiles', () => {
    it('should create the local files', async () => {
      jest
        .spyOn(tagService, 'getOrCreateTag')
        .mockResolvedValueOnce({
          id: 1,
          name: 'dubstep',
          user_vetted: false,
          tracks: [],
        });
      jest
        .spyOn(artistService, 'getOrCreateArtist')
        .mockResolvedValueOnce({
          id: 1,
          name: 'Virtual Riot',
          user_vetted: false,
          tracks: [],
        });
      jest.spyOn(trackRepository, 'create').mockReturnValueOnce(mockTrack);
      jest.spyOn(trackRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(trackService, 'getByFileName').mockResolvedValueOnce(null);
      jest.spyOn(trackSourceService, 'getByScId').mockResolvedValueOnce(null);
      jest.spyOn(lfService, 'getMp3Duration').mockResolvedValueOnce(100);
      jest
        .spyOn(NodeID3, 'read')
        .mockReturnValue({ artist: 'test', title: 'track', genre: 'dubstep' } as any);

      const res = await lfService.addLocalFiles([
        { id: '9305719475', fileName: 'file2 [9305719475].mp3' },
        { id: '50105770153', fileName: 'file3 [50105770153].mp3' },
      ]);

      expect(trackRepository.save).toHaveBeenCalled();
    });

    it('should link the file to an entry in db', async () => {
      jest.spyOn(trackService, 'getById').mockResolvedValue(mockTrack);
      jest.spyOn(trackService, 'getByFileName').mockResolvedValue(null);
      jest.spyOn(trackSourceService, 'getByScId').mockResolvedValue({id: 1, platform: 'soundcloud' as Platform, track: mockTrack, url: 'https://local', externalId: '1234'});

      const res = await lfService.addLocalFiles([
        { id: '9305719475', fileName: 'file2 [9305719475].mp3' },
        { id: '50105770153', fileName: 'file3 [50105770153].mp3' },
      ]);

      expect(trackRepository.save).toHaveBeenCalled();
    });

    it('should skip the loop turn entirely if the track is a local one', async () => {
      jest.spyOn(trackService, 'getByFileName').mockResolvedValue(mockTrack);

      const res = await lfService.addLocalFiles([
        { id: '9305719475', fileName: 'file2 [9305719475].mp3' },
        { id: '50105770153', fileName: 'file3 [50105770153].mp3' },
      ]);

      expect(trackRepository.save).not.toHaveBeenCalled();
    });
  });
});