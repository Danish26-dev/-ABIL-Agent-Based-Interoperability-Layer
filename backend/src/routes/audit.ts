import { Router } from 'express';

import { store } from '../store/memoryStore';

export const auditRouter = Router();

auditRouter.get('/', (_req, res) => {
  res.json({ items: store.auditLogs, count: store.auditLogs.length });
});

auditRouter.get('/replay-sessions', (_req, res) => {
  res.json({ items: store.replaySessions, count: store.replaySessions.length });
});
