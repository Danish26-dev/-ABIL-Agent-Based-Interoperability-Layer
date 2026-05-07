import { Router } from 'express';

import { healthRouter } from './health';
import { systemsRouter } from './systems';
import { eventsRouter } from './events';
import { conflictsRouter } from './conflicts';
import { auditRouter } from './audit';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/systems', systemsRouter);
apiRouter.use('/events', eventsRouter);
apiRouter.use('/conflicts', conflictsRouter);
apiRouter.use('/audit', auditRouter);
