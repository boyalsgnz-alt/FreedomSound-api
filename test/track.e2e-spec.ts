import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { createManyTestTracks } from './utils/factories';
import { clearDatabase, debugDb } from './clear-db';

describe('TrackController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
    await createManyTestTracks(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tracks (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/tracks?limit=3')
      .expect(200)
    console.log(res.body);
      expect(res.body.data).toHaveLength(3);
  });
});
