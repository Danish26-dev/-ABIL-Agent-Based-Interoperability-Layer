# ABIL Frontend

ABIL is a React-based simulation of an interoperability and reconciliation layer for Karnataka government systems. The app is split into two experiences:

- The public landing page, which explains the problem, architecture, workflow, and technology stack.
- The workspace, which simulates SWS, BESCOM, KSPCB, Labour, and a live conflict-resolution console.

## Available Scripts

From this directory you can run:

### `yarn start`

Runs the app in development mode.

### `yarn build`

Creates a production build with `craco`.

### `yarn test`

Starts the test runner.

## What to look at

- [src/App.js](src/App.js) for the landing page and route setup.
- [src/workspace/WorkspaceContext.jsx](src/workspace/WorkspaceContext.jsx) for the orchestration state and sync pipeline.
- [src/workspace/pages](src/workspace/pages) for the SWS, legacy, and conflict views.
