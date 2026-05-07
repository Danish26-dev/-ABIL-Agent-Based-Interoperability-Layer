import express from 'express';
import cors from 'cors';

import { apiRouter } from './routes';

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ service: 'ABIL backend', status: 'running' });
  });

  app.use('/api', apiRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path });
  });

  return app;
};
