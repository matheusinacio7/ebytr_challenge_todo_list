import { ObjectId } from 'mongodb';
import type { Db } from 'mongodb';

import type { Task } from '@types';
import type { RequireAtLeastOne } from 'type-fest';

import connect from './connect';

const getCollection = (db : Db) => db.collection('tasks');

const insertOne = (taskData: Task) => connect()
  .then(getCollection)
  .then((collection) => collection.insertOne(taskData));

const deleteOneById = (taskId: string) => connect()
  .then(getCollection)
  .then((collection) => collection.deleteOne({ _id: new ObjectId(taskId) }));

type UpdateTaskData = RequireAtLeastOne<Pick<Task, 'description' | 'title' | 'status'>> & {
  lastModifiedAt: number;
};

const updateOneById = (
  taskId: string,
  updatedData: UpdateTaskData,
) => connect()
  .then(getCollection)
  .then((collection) => collection.findOneAndUpdate({ _id: new ObjectId(taskId) }, { $set: updatedData }));

const getOneById = (taskId: string) => connect()
  .then(getCollection)
  .then((collection) => collection.findOne({ _id: new ObjectId(taskId) }));

const getAllUserTasks = (username: string) => connect()
  .then(getCollection)
  .then((collection) => collection.find({ username }));

export default {
  insertOne,
  deleteOneById,
  updateOneById,
  getOneById,
  getAllUserTasks,
};
