import { DataSource, Entity } from 'typeorm';
import { Track } from '../../src/tracks/track.entity';
import { Artist } from '../../src/artists/artist.entity';
import { Tag } from '../../src/tags/tag.entity';
import { count } from 'rxjs';

export async function createManyTestTracks(dataSource: DataSource): Promise<void> {
  let count = 0;
  const date = new Date();
  const repo = dataSource.getRepository(Track);
  while (count !== 10) {
    let track = repo.create({
      title: `Test track ${count}`,
      fileName: `track${count}.mp3`,
      duration: 100,
      user_vetted: count % 2 === 0,
      addedAt: date,
      tags: [],
      artists: [],
      sources: [],
    });
    track = await repo.save(track);
    count += 1;
  }
}

export async function createManyTestTags(dataSource: DataSource): Promise<void> {
  let count = 0;
  const repo = dataSource.getRepository(Tag);
  while (count !== 10) {
    let tag = repo.create({
      name: `Tag ${count}`,
      user_vetted: count % 2 === 0,
      tracks: [],
    });
    tag = await repo.save(tag);
    count += 1;
  }
}

export async function createManyTestArtists(dataSource: DataSource): Promise<void> {
  let count = 0;
  const repo = dataSource.getRepository(Artist);
  while (count !== 10) {
    let artist = repo.create({
      name: `Artist ${count}`,
      user_vetted: count % 2 === 0,
      tracks: []
    });
    artist = await repo.save(artist);
    count += 1;
  }
}

export async function createCoupledTestArtists(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Artist);
  let artist = repo.create({
    name: 'Artist 11 x Artist 12 x Artist 13',
    user_vetted: false,
    tracks: []
  });
  await repo.save(artist);
}
