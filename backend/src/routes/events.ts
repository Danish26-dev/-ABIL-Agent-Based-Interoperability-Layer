import { Router } from 'express';

import { store } from '../store/memoryStore';

export const eventsRouter = Router();

eventsRouter.get('/', (_req, res) => {
  res.json({ items: store.events, count: store.events.length });
});
