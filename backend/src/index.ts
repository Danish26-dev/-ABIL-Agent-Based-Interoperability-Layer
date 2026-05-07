import 'dotenv/config';
import { createServer } from 'node:http';

import { createApp } from './app';
import { attachSocket } from './socket';

const port = Number(process.env.PORT || 4000);
const app = createApp();
const server = createServer(app);

attachSocket(server);

server.listen(port, () => {
  console.log(`ABIL backend listening on http://localhost:${port}`);
});
