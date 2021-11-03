import { Router } from 'express';

import type { Task } from '@types';
import { Task as Controller } from '@controllers';

import { validateToken } from '@middlewares';

const router = Router();

router.post('/', validateToken, (req, res, next) => {
  const newTask = {
    ...req.body as Pick<Task, 'title' | 'description'>,
    username: res.locals.username,
  };

  Controller.create(newTask)
    .then((result) => {
      res.status(201).json({ insertedTask: result, message: 'Task created successfully.' });
    })
    .catch(next);
});

export default router;
