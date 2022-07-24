import express, { Express } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';

import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@shared-gittix/common';

const app: Express = express();
app.set('trust proxy', true); // express app will respond cookie request on https connections only

app.use(express.json());
app.use(
  cookieSession({
    signed: false, // cookies will not be encrypted
    secure: process.env.NODE_ENV !== 'test', // cookies will be provided only on https connection
  })
);
app.use(currentUser);

app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.get('*', async (req, res, next) => {
  // next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
