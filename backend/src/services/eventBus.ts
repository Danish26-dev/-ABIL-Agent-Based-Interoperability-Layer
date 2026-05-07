import { EventEmitter } from 'node:events';

import { SyncEvent } from '../domain/types';

export type BusEventName =
  | 'listener-agent-active'
  | 'sync-started'
  | 'conflict-detected'
  | 'sync-completed'
  | 'audit-recorded'
  | 'agent-state';

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

export const publishBusEvent = (name: BusEventName, payload: unknown) => {
  eventBus.emit(name, payload);
};

export const subscribeBus = (name: BusEventName, handler: (payload: unknown) => void) => {
  eventBus.on(name, handler);
  return () => eventBus.off(name, handler);
};

export const enqueueEvent = (event: SyncEvent) => {
  publishBusEvent('listener-agent-active', event);
  return event;
};
