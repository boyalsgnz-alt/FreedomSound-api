import { DataSource } from 'typeorm';
import { Track } from '../../src/tracks/track.entity';
import { Artist } from '../../src/artists/artist.entity';

export async function createTestTrack(
  dataSource: DataSource,
  overrides: Partial<Track> = {},
): Promise<Track> {
  const repo = dataSource.getRepository(Track);
  const track = repo.create({
    title: 'Test track',
    fileName: 'track.mp3',
    duration: 100,
    user_vetted: false,
    ...overrides,
  });
  return repo.save(track);
}

export async function createTestArtist(
  dataSource: DataSource,
  overrides: Partial<Artist> = {},
): Promise<Artist> {
  const repo = dataSource.getRepository(Artist);
  const artist = repo.create({
    name: 'Test artist',
    user_vetted: false,
    tracks: [],
  });
  return repo.save(artist);
}

export async function createManyTestTracks(dataSource: DataSource): Promise<Track[]> {
  let count = 0;
  let tracks: Track[] = [];
  const date = new Date();
  const repo = dataSource.getRepository(Track);
  while (count !== 10) {
    let track = repo.create({
      title: `Test track ${count}`,
      fileName: `track${count}.mp3`,
      duration: 100,
      user_vetted: false,
      addedAt: date,
      tags: [],
      artists: [],
      sources: [],
    });
    track = await repo.save(track);
    tracks.push(track);
    count += 1;
  }
  return tracks;
}
