import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { clearDatabase } from './clear-db';
import { createCoupledTestArtists, createManyTestArtists } from './utils/factories';
import request from 'supertest';
import { response } from 'express';

describe('ArtistController', () => {
  let dataSource: DataSource;
  let app: INestApplication;

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
    await createManyTestArtists(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /artists', () => {
    it('should return 5 artists', async () => {
      const res = await request(app.getHttpServer())
        .get('/artists?limit=5&user_vetted=true&sort=desc')
        .expect(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.data[0].id).toEqual(9);
      expect(res.body.data[0].name).toEqual('Artist 8');
    });
  });

  describe('GET /artists/:id', () => {
    it('should return the artist identified by the id', async () => {
      const res = await request(app.getHttpServer())
        .get('/artists/7')
        .expect(200);
      expect(res.body.data.id).toEqual(7);
      expect(res.body.data.name).toEqual('Artist 6');
    });

    it('should throw 404 if the artist was not found', async () => {
      await request(app.getHttpServer()).get('/artists/17').expect(404);
    });
  });

  describe('POST /artists', () => {
    it('should return the newly created artist', async () => {
      const res = await request(app.getHttpServer())
        .post('/artists')
        .send({name: 'John Doe', user_vetted: true, tracks: []})
        .expect(201);
      expect(res.body.data.id).toEqual(11);
      expect(res.body.data.name).toEqual('John Doe');
    });
  });

  describe('DELETE /artists/:id', () => {
    it('should delete the artist identified by the id', async () => {
      await request(app.getHttpServer())
        .delete('/artists/7')
        .expect(204);
    });

    it('should throw 404 if the artist was not found', async () => {
      await request(app.getHttpServer()).delete('/artists/17').expect(404);
    })
  });

  describe('DELETE /artists', () => {
    it('should partially delete the artists given as params', async () => {
      const res = await request(app.getHttpServer()).delete('/artists?ids=3,7,14').expect(200);
      const resGet = await request(app.getHttpServer())
        .get('/artists')
        .expect(200);
      expect(res.body.data.notDeleted).toHaveLength(1);
      expect(resGet.body.data).toHaveLength(5);
    });
  });

  describe('PATCH /artists/:id', () => {
    it('should update the artist identified by the id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/artists/7')
        .send({name: 'Jane Doe'})
        .expect(200);
      expect(res.body.data.name).toEqual('Jane Doe');
    });

    it('should throw 404 if the artist was not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/artists/17')
        .send({ name: 'Jane Doe' })
        .expect(404);
    });
  });

  describe('POST /artists/:id/decouple', () => {
    it('should decouple the artist identified by id', async () => {
      await createCoupledTestArtists(dataSource);
      await request(app.getHttpServer())
        .post('/artists/11/decouple')
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/artists')
        .expect(200);
      expect(res.body.data).toHaveLength(8);
    });
  });

  describe('GET /artists/synchronize', () => {
    it('should update ID3 tags for local files', async () => {
      const res = await request(app.getHttpServer())
        .get('/artists/synchronize')
        .expect(204);
    });
  });
});
