import { Router } from 'express';
import { z } from 'zod';

import { resolveConflict } from '../services/orchestrator';
import { store } from '../store/memoryStore';

export const conflictsRouter = Router();

conflictsRouter.get('/', (_req, res) => {
  res.json({ items: store.conflicts, count: store.conflicts.length });
});

conflictsRouter.post('/:conflictId/resolve', (req, res) => {
  const schema = z.object({ authoritative: z.enum(['sws', 'bescom', 'kspcb', 'labour']) });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const result = resolveConflict(req.params.conflictId, parsed.data.authoritative);
  if (!result) {
    return res.status(404).json({ error: 'Conflict not found' });
  }

  return res.json(result);
});
