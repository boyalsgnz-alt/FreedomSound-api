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

  describe('GET /playlists/generate', () => {
    it('should return a playlist of max 10 songs', async () => {
      const res = await request(app.getHttpServer()).get('/playlists/generate').expect(200);

      expect(res.body).toHaveLength(1);
    })
  })
})