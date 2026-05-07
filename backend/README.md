# ABIL Backend

Deterministic, event-driven backend scaffold for the ABIL demo.

## What it provides

- Mock SWS, BESCOM, KSPCB, and Labour APIs
- A canonical business model
- Deterministic listener, decision, translation, conflict, sync, and audit stages
- Socket.IO events for real-time frontend updates
- In-memory stores for systems, events, conflicts, audit logs, policies, and replay data

## Scripts

```bash
yarn install
yarn dev
```

For production:

```bash
yarn build
yarn start
```

## Main endpoints

- `GET /health`
- `GET /api/systems`
- `GET /api/systems/:system`
- `POST /api/systems/:system/update`
- `POST /api/demo/sws-update`
- `GET /api/events`
- `GET /api/conflicts`
- `GET /api/audit`
- `GET /api/policies`
