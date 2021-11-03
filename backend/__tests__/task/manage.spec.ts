/* global jest, beforeEach, afterAll, afterEach */

import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { ObjectId } from 'mongodb';

import type { Task } from '../../src/types';

import app from '../../app';
import connect, { disconnect } from '../../src/models/connect';
import { closeCacheServer } from '../../src/middlewares/withCache';
import { closeBlacklistServer } from '../../src/services/token';

jest.mock('../../src/models/connect');

afterAll(async () => {
  await closeCacheServer();
  await closeBlacklistServer();
  await disconnect();
});

const url = '/task';
const isEqualWithErrorMargin = (a : number, b : number, error : number) => {
  const absoluteDifference = Math.abs(a - b);
  return absoluteDifference < error;
};

describe('POST /task (create task)', () => {
  const validUser = {
    username: 'janete_corca',
    email: 'janete@corca.com',
    password: '123janete456corca',
  };

  const validTask = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  let accessToken : string;

  beforeEach(async () => {
    await request(app)
      .post('/users')
      .send(validUser)
      .expect(201)
      .then((response) => {
        const cookies = (response.headers['set-cookie'] as Array<string>).reduce((acc : Record<string, string>, cookie : string) => {
          const [type, fullDescription] = cookie.split('=');
          const [value, ..._rest] = fullDescription.split(';');
          acc[type] = value;
          return acc;
        }, {});

        accessToken = cookies.access_token;
      });
  });

  afterEach(async () => {
    await connect()
      .then((db) => db.collection('users').deleteMany({}));

    await connect()
      .then((db) => db.collection('tasks').deleteMany({}));
  });

  describe('With valid data, creates a task in the db', () => {
    it('title and description', async () => {
      let id : string;

      await request(app)
        .post(url)
        .set('Authorization', accessToken)
        .send(validTask)
        .expect(201)
        .expect((res) => {
          expect(res.body.insertedTask.id).not.toBeUndefined();
          id = res.body.insertedTask.id;
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(id)) as Promise<Task>)
        .then((foundTask : Task) => {
          expect(foundTask.title).toBe(validTask.title);
          expect(foundTask.description).toBe(validTask.description);
          expect(isEqualWithErrorMargin(
            foundTask.createdAt,
            new Date().valueOf(),
            600000,
          )).toBe(true);

          expect(foundTask.createdAt).toBe(foundTask.lastModifiedAt);
          expect(foundTask.status).toBe('to_do');
          expect(foundTask.username).toBe(validUser.username);
        });
    });

    it('only title', async () => {
      let id : string;

      await request(app)
        .post(url)
        .set('Authorization', accessToken)
        .send({ title: validTask.title })
        .expect(201)
        .expect((res) => {
          expect(res.body.insertedTask.id).not.toBeUndefined();
          id = res.body.insertedTask.id;
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(id)) as Promise<Task>)
        .then((foundTask : Task) => {
          expect(foundTask.title).toBe(validTask.title);
          expect(foundTask.description).toBeUndefined();
          expect(isEqualWithErrorMargin(
            foundTask.createdAt,
            new Date().valueOf(),
            600000,
          )).toBe(true);

          expect(foundTask.createdAt).toBe(foundTask.lastModifiedAt);
          expect(foundTask.status).toBe('to_do');
          expect(foundTask.username).toBe(validUser.username);
        });
    });

    it('only description', async () => {
      let id : string;

      await request(app)
        .post(url)
        .set('Authorization', accessToken)
        .send({ description: validTask.description })
        .expect(201)
        .expect((res) => {
          expect(res.body.insertedTask.id).not.toBeUndefined();
          id = res.body.insertedTask.id;
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(id)) as Promise<Task>)
        .then((foundTask : Task) => {
          expect(foundTask.title).toBeUndefined();
          expect(foundTask.description).toBe(validTask.description);
          expect(isEqualWithErrorMargin(
            foundTask.createdAt,
            new Date().valueOf(),
            600000,
          )).toBe(true);

          expect(foundTask.createdAt).toBe(foundTask.lastModifiedAt);
          expect(foundTask.status).toBe('to_do');
          expect(foundTask.username).toBe(validUser.username);
        });
    });
  });
});
