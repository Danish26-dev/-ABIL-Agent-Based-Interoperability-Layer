import { Router } from 'express';
import { z } from 'zod';

import { orchestrateChange, orchestrateChangeWithStrands } from '../services/orchestrator';
import { store } from '../store/memoryStore';
import { SystemName } from '../domain/types';

const updateSchema = z.object({
  ubid: z.string().min(1),
  patch: z.record(z.unknown()).refine((value) => Object.keys(value).length > 0, {
    message: 'Patch cannot be empty',
  }),
  origin: z.enum(['sws', 'bescom', 'kspcb', 'labour']).optional(),
  reason: z.string().optional(),
});

const toSystemName = (value: string): SystemName | null => {
  if (value === 'sws' || value === 'bescom' || value === 'kspcb' || value === 'labour') {
    return value;
  }
  return null;
};

export const systemsRouter = Router();

systemsRouter.get('/', (_req, res) => {
  res.json({
    canonical: store.canonical,
    systems: store.systems,
    policies: store.policies,
  });
});

systemsRouter.get('/:system', (req, res) => {
  const system = toSystemName(req.params.system);
  if (!system) {
    return res.status(400).json({ error: 'Unknown system' });
  }

  return res.json(store.systems[system]);
});

systemsRouter.post('/:system/update', async (req, res) => {
  const system = toSystemName(req.params.system);
  if (!system) {
    return res.status(400).json({ error: 'Unknown system' });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const runner = process.env.AGENT_MODE === 'strands' ? orchestrateChangeWithStrands : orchestrateChange;

  const result = await (runner as any)({
    system,
    ubid: parsed.data.ubid,
    patch: parsed.data.patch,
    origin: parsed.data.origin ?? system,
    reason: parsed.data.reason,
  });

  return res.status(200).json(result);
});

systemsRouter.post('/sws/update', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const runner = process.env.AGENT_MODE === 'strands' ? orchestrateChangeWithStrands : orchestrateChange;

  const result = await (runner as any)({
    system: 'sws',
    ubid: parsed.data.ubid,
    patch: parsed.data.patch,
    origin: parsed.data.origin ?? 'sws',
    reason: parsed.data.reason,
  });

  return res.status(200).json(result);
});

systemsRouter.post('/demo/address-change', async (_req, res) => {
  const runner = process.env.AGENT_MODE === 'strands' ? orchestrateChangeWithStrands : orchestrateChange;

  const result = await (runner as any)({
    system: 'sws',
    ubid: store.canonical.ubid,
    patch: {
      address: 'No. 47, Industrial Estate, Peenya, Bengaluru, Karnataka - 560058',
    },
    origin: 'sws',
    reason: 'Demo address sync',
  });

  return res.json(result);
});
