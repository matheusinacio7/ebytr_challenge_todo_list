import { Task as Model } from '@models';
import { validate } from '@validation';
import type { Task } from '@types';

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
    .then(({ insertedId }) => ({ ...newTask, id: insertedId }));
};

export default {
  create,
};
