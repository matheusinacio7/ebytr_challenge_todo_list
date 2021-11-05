import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { catchInvalidEndpoint, handleError } from '@middlewares';
import * as routers from '@routers';

const app = express();

app.use(
  express.json(),
  helmet(),
  cors(),
);

// Insert your routers here;

app.use('/', routers.root);
app.use('/user', routers.user);
app.use('/task', routers.task);

app.use(catchInvalidEndpoint);

app.use(handleError);

export default app;
