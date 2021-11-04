import { ObjectId } from 'mongodb';
import type { Db } from 'mongodb';

import type { Task } from '@types';

import connect from './connect';

const getCollection = (db : Db) => db.collection('tasks');

const insertOne = (taskData: Task) => connect()
  .then(getCollection)
  .then((collection) => collection.insertOne(taskData));

const deleteOneById = (taskId: string) => connect()
  .then(getCollection)
  .then((collection) => collection.deleteOne({ _id: new ObjectId(taskId) }));

export default {
  insertOne,
  deleteOneById,
};
