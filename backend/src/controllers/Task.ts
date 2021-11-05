import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import type { RequireAtLeastOne } from 'type-fest';

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

  return Model.insertOne({ ...newTask })
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

const updateById = (taskId: string, updatedData: RequireAtLeastOne<Pick<Task, 'description' | 'title' | 'status'>>) => {
  if (!ObjectId.isValid(taskId)) {
    throw new NotFoundError('Task not found.');
  }

  const updatedTask = {
    ...updatedData,
    lastModifiedAt: new Date().getTime(),
  };

  validate('updateTask', updatedTask);

  return Model.updateOneById(taskId, { ...updatedTask })
    .then((result) => {
      if (!result) {
        throw new NotFoundError('Task not found.');
      }
      const modifiedDoc = result.value as Task;

      const after = { ...updatedData };
      const before : Partial<Task> = {};

      (Object.keys(after) as Array<keyof typeof after>).forEach((key) => {
        before[key] = modifiedDoc[key] as any;
      });

      return { before, after };
    });
};

export default {
  create,
  deleteById,
  updateById,
};
