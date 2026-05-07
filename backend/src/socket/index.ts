import { Server as HttpServer } from 'node:http';

import { Server } from 'socket.io';

import { subscribeBus } from '../services/eventBus';

export const attachSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    socket.emit('agent-state', { status: 'connected', message: 'ABIL socket connected' });
  });

  const subscriptions = [
    ['listener-agent-active', 'listener-agent-active'],
    ['sync-started', 'sync-started'],
    ['conflict-detected', 'conflict-detected'],
    ['sync-completed', 'sync-completed'],
    ['audit-recorded', 'audit-recorded'],
    ['agent-state', 'agent-state'],
  ] as const;

  subscriptions.forEach(([busEvent, socketEvent]) => {
    subscribeBus(busEvent, (payload) => {
      io.emit(socketEvent, payload);
    });
  });

  return io;
};
