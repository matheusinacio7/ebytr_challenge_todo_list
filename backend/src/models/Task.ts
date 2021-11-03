import type { Db } from 'mongodb';

import connect from './connect';

const getCollection = (db : Db) => db.collection('tasks');

const insertOne = (taskData: any) => connect()
  .then(getCollection)
  .then((collection) => collection.insertOne(taskData));

export default {
  insertOne,
};
