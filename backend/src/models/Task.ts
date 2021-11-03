import type { Db } from 'mongodb';

import type { Task } from '@types';

import connect from './connect';

const getCollection = (db : Db) => db.collection('tasks');

const insertOne = (taskData: Task) => connect()
  .then(getCollection)
  .then((collection) => collection.insertOne(taskData));

export default {
  insertOne,
};
