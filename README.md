# Atlas Service Desk

**Live demo:** https://hashino.github.io/atlas/

An MVP for Atlas Industrial Services, a fictional equipment-maintenance company. It shows one workflow: customer requests come in, get triaged and dispatched, and customers are kept informed. The problem statement and sample data are in [`INTRO.md`](INTRO.md).

The app is a frontend-only simulation. It has no backend and no real email, WhatsApp or phone integration, and all data is synthetic.

## What the demo shows

- **Operator screen:** a requests table, a technicians table and a live event log. The operator can:
  - assign or unassign technicians;
  - change a request's urgency;
  - post status updates;
  - turn auto-assignment on or off.
- **Technician screen:** a technician posts status updates on their jobs and marks jobs complete.
- **Automation (simulated):**
  - incoming messages get an AI urgency triage;
  - follow-ups are linked to the customer's open request;
  - customers get updates on the channel they used;
  - a free technician is given the next request in the queue (highest urgency first, then oldest).

The clock starts at 09:00 on 1 October 2026. A scripted 7.5-minute stream of events runs from there, and every feature appears in the first ~3 minutes. Use the header buttons to pause or restart. The ⓘ button lists the demo's assumptions.

## Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (CI uses Node 24), with npm.

No other system dependencies, services or environment variables are needed.

## Running locally

```sh
git clone https://github.com/Hashino/atlas.git
cd atlas
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the domain tests (Vitest) |
| `npm run build` | Type-checks and builds the static site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Lints with oxlint |

## Dependencies

Runtime:

- `react`, `react-dom`: UI
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`: component library and its styling engine
- `@fontsource/roboto`: self-hosted Roboto font

Development:

- `vite`, `@vitejs/plugin-react`: dev server and bundler
- `typescript`, `@types/*`: type checking
- `vitest`: tests
- `oxlint`: linting

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which tests, builds and publishes to GitHub Pages.
