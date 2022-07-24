import express, { Express } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.get('*', async (req, res, next) => {
  // next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
