import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './clear-db';
import { createManyTestTags } from './utils/factories';
import request from 'supertest';

describe('TagsController (e2e)', () => {
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
    await createManyTestTags(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /tags', () => {
    it('should return 5 tags', async () => {
      const res = await request(app.getHttpServer())
        .get('/tags?limit=5&user_vetted=true&sort=desc')
        .expect(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.data[0].id).toEqual(9);
      expect(res.body.data[0].name).toEqual('Tag 8');
    });
  });

  describe('GET /tags/:id', () => {
    it('should return the tag identified by the id', async () => {
      const res = await request(app.getHttpServer()).get('/tags/3').expect(200);
      expect(res.body.data).toEqual({
        id: 3,
        name: 'Tag 2',
        user_vetted: true,
      });
    });

    it('should throw 404 if tag is not found', async () => {
      const res = await request(app.getHttpServer())
        .get('/tags/20')
        .expect(404);
    });
  });

  describe('POST /tags/', () => {
    it('should create the tag and return it', async () => {
      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ name: 'User generated tag', user_vetted: true })
        .expect(201);
      expect(res.body.data).toEqual({
        id: 11,
        name: 'User generated tag',
        user_vetted: true,
        tracks: [],
      });
    });
  });

  describe('DELETE /tags/:id', () => {
    it('should delete the tag identified by the id', async () => {
      await request(app.getHttpServer())
        .delete('/tags/7')
        .expect(204);
      const resGet = await request(app.getHttpServer()).get('/tags/');
      expect(resGet.body.data).toHaveLength(9);
      expect(resGet.body.data[6].id).toEqual(8);
    });

    it('should throw 404 if the tag was not found', async () => {
      await request(app.getHttpServer()).delete('/tags/17').expect(404);
    });
  });

  describe('DELETE /tags/', () => {
    it('should delete in bulk the tags given in the url', async () => {
      await request(app.getHttpServer()).delete('/tags?ids=7,8,9').expect(200);
      const resGet = await request(app.getHttpServer()).get('/tags/');
      expect(resGet.body.data).toHaveLength(7);
    });

    it('should partially delete if a tag is not found', async () => {
      const res = await request(app.getHttpServer()).delete('/tags?ids=17,7,8').expect(200);
      expect(res.body.data.notDeleted).toHaveLength(1);
    });
  });

  describe('PATCH /tags/:id', () => {
    it('should update the tag identified by id', async () => {
      const res = await request(app.getHttpServer()).patch('/tags/7').send({name: 'user-defined name'}).expect(200);
      expect(res.body.data.name).toEqual('user-defined name');
    });

    it('should throw 404 if the tag was not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/tags/17').send({name: 'user-defined name'}).expect(404);
    });
  });
});
