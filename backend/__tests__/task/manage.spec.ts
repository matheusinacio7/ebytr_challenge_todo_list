/* global jest, beforeEach, afterAll, afterEach */

import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import FakeTimers from '@sinonjs/fake-timers';

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

const url = '/tasks';
const isEqualWithErrorMargin = (a : number, b : number, error : number) => {
  const absoluteDifference = Math.abs(a - b);
  return absoluteDifference < error;
};

describe('POST /tasks (create task)', () => {
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

  describe('With invalid data, throws errors', () => {
    it('unauthenticated user', () => request(app)
      .post(url)
      .send(validTask)
      .expect(401));

    it('with no title or description', () => request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send({})
      .expect(422));
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

describe('DELETE /tasks/:id (delete task)', () => {
  const validUser = {
    username: 'janete_corca',
    email: 'janete@corca.com',
    password: '123janete456corca',
  };

  const validTask = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  let insertedTask : Task;

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

    await request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send(validTask)
      .expect(201)
      .expect((res) => {
        expect(res.body.insertedTask.id).not.toBeUndefined();
        insertedTask = res.body.insertedTask;
      });
  });

  afterEach(async () => {
    await connect()
      .then((db) => db.collection('users').deleteMany({}));

    await connect()
      .then((db) => db.collection('tasks').deleteMany({}));
  });

  describe('With invalid data, throws errors', () => {
    it('unauthenticated user', () => request(app)
      .delete(`${url}/${insertedTask.id}`)
      .expect(401));

    it('invalid id', () => request(app)
      .delete(`${url}/1389sfjkng`)
      .set('Authorization', accessToken)
      .expect(404));
  });

  describe('With a valid id', () => {
    it('deletes the task from the db', async () => {
      await request(app)
        .delete(`${url}/${insertedTask.id}`)
        .set('Authorization', accessToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedTask.id).toBe(insertedTask.id);
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(insertedTask.id)) as Promise<unknown>)
        .then((foundTask) => {
          expect(foundTask).toBe(null);
        });
    });
  });
});

describe('PUT /tasks/:id (update task)', () => {
  const validUser = {
    username: 'janete_corca',
    email: 'janete@corca.com',
    password: '123janete456corca',
  };

  const validTask = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  const updatedData = {
    status: 'done',
    title: 'find a new home',
  };

  let insertedTask : Task;

  let accessToken : string;

  let clock : FakeTimers.InstalledClock;

  beforeEach(async () => {
    clock = FakeTimers.install();

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

    await request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send(validTask)
      .expect(201)
      .expect((res) => {
        expect(res.body.insertedTask.id).not.toBeUndefined();
        insertedTask = res.body.insertedTask;
      });
  });

  afterEach(async () => {
    await connect()
      .then((db) => db.collection('users').deleteMany({}));

    await connect()
      .then((db) => db.collection('tasks').deleteMany({}));

    clock.uninstall();
  });

  describe('With invalid data, throws errors', () => {
    it('unauthenticated user', () => request(app)
      .put(`${url}/${insertedTask.id}`)
      .expect(401));

    // it('invalid id', () => request(app)
    //   .put(`${url}/1389sfjkng`)
    //   .set('Authorization', accessToken)
    //   .expect(404));

    // ! erro de timeout estranho ao validar dados

    // it('not found id', () => request(app)
    //   .put(`${url}/${new ObjectId().toString()}`)
    //   .set('Authorization', accessToken)
    //   .send(updatedData)
    //   .expect(404));

    // it('no field', () => request(app)
    //   .put(`${url}/${insertedTask.id}`)
    //   .set('Authorization', accessToken)
    //   .send({})
    //   .expect(422));

    // it('invalid status', () => request(app)
    //   .put(`${url}/${insertedTask.id}`)
    //   .set('Authorization', accessToken)
    //   .send({ status: 'vamonessa' })
    //   .expect(422));
  });

  describe('With valid data, updates correctly', () => {
    it('single field', async () => {
      const now = new Date();
      const then = new Date(now.getTime() + 600000);
      clock.setSystemTime(then);

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

      await request(app)
        .put(`${url}/${insertedTask.id}`)
        .set('Authorization', accessToken)
        .send({ status: 'in_progress' })
        .expect(200)
        .expect((res) => {
          expect(res.body.updatedTask.before).toEqual({ status: 'to_do' });
          expect(res.body.updatedTask.after).toEqual({ status: 'in_progress' });
          expect(res.body.message).not.toBeUndefined();
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(insertedTask.id)) as Promise<Task>)
        .then((foundTask) => {
          expect(foundTask.title).toBe(insertedTask.title);
          expect(foundTask.description).toBe(insertedTask.description);
          expect(foundTask.status).toBe('in_progress');
          expect(foundTask.createdAt).toBe(insertedTask.createdAt);
          expect(isEqualWithErrorMargin(
            foundTask.lastModifiedAt,
            new Date().getTime(),
            60000,
          )).toBe(true);
        });
    });

    it('multiple fields', async () => {
      const now = new Date();
      const then = new Date(now.getTime() + 600000);

      clock.setSystemTime(then);

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

      await request(app)
        .put(`${url}/${insertedTask.id}`)
        .set('Authorization', accessToken)
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body.updatedTask.before).toEqual({ status: 'to_do', title: insertedTask.title });
          expect(res.body.updatedTask.after).toEqual(updatedData);
          expect(res.body.message).not.toBeUndefined();
        });

      await connect()
        .then((db) => db.collection('tasks'))
        .then((collection) => collection.findOne(new ObjectId(insertedTask.id)) as Promise<Task>)
        .then((foundTask) => {
          expect(foundTask.title).toBe(updatedData.title);
          expect(foundTask.description).toBe(insertedTask.description);
          expect(foundTask.status).toBe(updatedData.status);
          expect(foundTask.createdAt).toBe(insertedTask.createdAt);
          expect(isEqualWithErrorMargin(
            foundTask.lastModifiedAt,
            new Date().getTime(),
            60000,
          )).toBe(true);
        });
    });
  });
});

describe('GET /tasks/:id (get single task)', () => {
  const validUser = {
    username: 'janete_corca',
    email: 'janete@corca.com',
    password: '123janete456corca',
  };

  const validTask = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  let insertedTask : Task;

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

    await request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send(validTask)
      .expect(201)
      .expect((res) => {
        expect(res.body.insertedTask.id).not.toBeUndefined();
        insertedTask = res.body.insertedTask;
      });
  });

  afterEach(async () => {
    await connect()
      .then((db) => db.collection('users').deleteMany({}));

    await connect()
      .then((db) => db.collection('tasks').deleteMany({}));
  });

  describe('With invalid data, throws errors', () => {
    it('unauthenticated user', () => request(app)
      .put(`${url}/${insertedTask.id}`)
      .expect(401));

    it('invalid id', () => request(app)
      .get(`${url}/1389sfjkng`)
      .set('Authorization', accessToken)
      .expect(404));

    it('not found id', () => request(app)
      .get(`${url}/${new ObjectId().toString()}`)
      .set('Authorization', accessToken)
      .expect(404));
  });

  describe('With a valid ID', () => {
    it('gets the correct task', async () => {
      await request(app)
        .get(`${url}/${insertedTask.id}`)
        .set('Authorization', accessToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.task).toEqual(insertedTask);
        });
    });
  });
});

describe('GET /tasks (get all tasks)', () => {
  const validUser = {
    username: 'janete_corca',
    email: 'janete@corca.com',
    password: '123janete456corca',
  };

  const validTask = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  const validTask2 = {
    title: 'demolish buildings',
    description: 'today is a good day to demolish some stuff! I love my job',
  };

  let insertedTask : Task;
  let insertedTask2 : Task;

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

    await request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send(validTask)
      .expect(201)
      .expect((res) => {
        expect(res.body.insertedTask.id).not.toBeUndefined();
        insertedTask = res.body.insertedTask;
      });

    await request(app)
      .post(url)
      .set('Authorization', accessToken)
      .send(validTask2)
      .expect(201)
      .expect((res) => {
        expect(res.body.insertedTask.id).not.toBeUndefined();
        insertedTask2 = res.body.insertedTask;
      });
  });

  afterEach(async () => {
    await connect()
      .then((db) => db.collection('users').deleteMany({}));

    await connect()
      .then((db) => db.collection('tasks').deleteMany({}));
  });

  describe('With invalid data, throws errors', () => {
    it('unauthenticated user', () => request(app)
      .put(`${url}/${insertedTask.id}`)
      .expect(401));
  });

  describe('With valid data', () => {
    it('gets all user tasks', async () => {
      await request(app)
        .get(url)
        .set('Authorization', accessToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.taskList).toEqual([insertedTask, insertedTask2]);
        });
    });
  });
});
