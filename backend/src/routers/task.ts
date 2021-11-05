import { Router } from 'express';

import type { Task } from '@types';
import { Task as Controller } from '@controllers';

import { validateToken } from '@middlewares';

const router = Router();

router.use(validateToken);

router.post('/', (req, res, next) => {
  const newTask = {
    ...req.body as Pick<Task, 'title' | 'description'>,
    username: res.locals.username,
  };

  Controller.create(newTask)
    .then((insertedTask) => {
      res.status(201).json({ insertedTask, message: 'Task created successfully.' });
    })
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  Controller.deleteById(req.params.id)
    .then((taskId) => {
      res.status(200).json({ deletedTask: { id: taskId }, message: 'Task deleted successfully.' });
    })
    .catch(next);
});

router.put('/:id', (req, res, next) => {
  Controller.updateById(req.params.id, req.body)
    .then((updatedTask) => {
      res.status(200).json({ updatedTask, message: 'Task updated successfully.' });
    })
    .catch(next);
});

export default router;
