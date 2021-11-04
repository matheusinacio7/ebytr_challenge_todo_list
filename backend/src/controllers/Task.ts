import { ObjectId } from 'mongodb';
import { Task as Model } from '@models';
import { validate } from '@validation';
import type { Task } from '@types';

import { NotFoundError } from '@errors';

const create = (coreTaskInfo: Pick<Task, 'title' | 'username' | 'description'>) => {
  const now = new Date().valueOf();

  const newTask : Task = {
    ...coreTaskInfo,
    createdAt: now,
    lastModifiedAt: now,
    status: 'to_do',
  };

  validate('createTask', newTask);

  return Model.insertOne(newTask)
    .then(({ insertedId }) => ({ ...newTask, id: insertedId.toString() }));
};

const deleteById = (taskId: string) => {
  if (!ObjectId.isValid(taskId)) {
    throw new NotFoundError('Task not found.');
  }

  return Model.deleteOneById(taskId)
    .then(({ deletedCount }) => {
      if (deletedCount !== 1) {
        throw new NotFoundError('Task not found.');
      }

      return taskId;
    });
};

export default {
  create,
  deleteById,
};
