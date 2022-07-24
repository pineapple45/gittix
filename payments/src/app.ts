import express, { Express } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/new';

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

app.use(createChargeRouter); // USING THE CREATE CHARGE ROUTE HANDLER

app.get('*', async (req, res, next) => {
  // next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
