import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './clear-db';
import { createFullMockDb } from './utils/factories';
import request from 'supertest';

describe('PlaylistController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);

    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
    await createFullMockDb(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /playlists/generate', () => {
    it('should return a playlist matching artists', async () => {
      const res = await request(app.getHttpServer())
        .post('/playlists/generate')
        .send({
          artists: [1, 2],
          limit: 30,
          onlyAvailableTracks: false
        })
        .expect(200);

      // no artists have been linked in factories
      expect(res.body).toHaveLength(0);
    });

    it('should return a playlist matching tags', async () => {
      const res = await request(app.getHttpServer())
        .post('/playlists/generate')
        .send({
          tags: [1, 2],
          limit: 30,
          onlyAvailableTracks: false,
        })
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });
});
