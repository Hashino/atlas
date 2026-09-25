# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MVP for Atlas Industrial Services (fictional). `INTRO.md` is the problem statement and holds the sample dataset (R101–R108, technicians T1–T3). It describes the problem; it is not a feature checklist.

Everything is in **English**: code, identifiers, comments, UI copy, log messages and docs.

The whole app is a **frontend-only simulation**: no backend and no real email/WhatsApp/phone integrations. All data is clearly synthetic.

### Stack

- React + TypeScript (Vite), MUI with a **light theme**.
- Hosted as a static site on **GitHub Pages**, deployed by `.github/workflows/deploy.yml` on push to `main` (the workflow runs the tests, then builds). Vite uses `base: './'` so the build works under any `/<repo>/` path. Don't use client-side routing that needs server rewrites: the screen toggle is plain app state.

## Commands

- `npm run dev`: dev server
- `npm test`: Vitest, run once. Single file: `npx vitest run src/domain/simulation.test.ts`; single test: add `-t "<name>"`.
- `npm run build`: type-check (`tsc -b`) plus production build into `dist/`
- `npm run lint`: oxlint

## Product scope

Two screens, switched by a toggle at the top of the page:

1. **Operator dashboard**
   - Requests table, Technicians table, and a live **event log stream**.
   - Operator can assign and unassign technicians on requests, change a request's urgency, and post status updates on requests.
   - An **auto-assign on/off toggle** sits next to the Technicians table. It starts **on**. When it is off, the 1-second tick skips auto-assignment and the operator assigns manually. Flipping it is logged.
2. **Technician view**
   - Technician adds status updates to their requests and marks a request as complete.

Simulated automation, every step of which must appear in the event log:
- **Ingest**: new customer messages arrive on a channel (Email / WhatsApp / Phone) and get an **AI urgency classification** (simulated; show the assigned urgency and a short reason in the log).
- **Technician status updates** arrive automatically over time.
- **Chained events are 1 second apart**: a consequence lands one tick after its cause (inbound message → AI triage → customer acknowledgement; status update / assignment / completion → customer message; technician freed → auto-assign). Implemented as `state.pending` effects that `tick` runs when due.
- **Customer notifications**: every status change sends an update to the customer **on the same channel the request came in on** (simulated and logged, e.g. "WhatsApp → C02: …").
- **Queue ordering**: the head of the queue (unassigned requests) is always the **oldest request among those with the highest urgency**, i.e. sort by urgency descending, then received time ascending.
- **Auto-assignment** (while the toggle is on): a check runs on a **1-second tick** of the simulation clock. Whenever it finds a free technician (no active request, e.g. right after completing one or after being unassigned), it assigns them the head of the queue.

## Simulation clock and scripted timeline

- The app runs on a **fake clock** that starts at **09:00, 1 October 2026** (Atlas local time, per `INTRO.md`). Every timestamp in the UI and log comes from this clock, never from `Date.now()` directly.
- Initial state is seeded from the `INTRO.md` table, keeping each request's "current record" state (e.g. R102 assigned to T1, R106 assigned to T2 and waiting for a part, R107 still in progress under T3).
- A scripted event timeline covers **7.5 minutes** of events (09:00–09:07:30). It is paced so that **every feature shows up within the first ~3 minutes** (ingest + AI triage, tech update, customer notification, a technician becoming free and receiving the head of the queue). The rest keeps the demo alive.
- Scripted events and operator actions must go through the **same state-mutation path**, so auto-assignment, customer notifications and logging behave the same whoever triggers them.

## Architecture guidelines

- `src/domain/` is pure TypeScript with no React: `simulation.ts` (reducer, seeding, scripted-event runner, auto-assign, notifications), `queue.ts` (queue order, free-technician rule, response targets), `triage.ts` (keyword-based AI triage stub), `seed.ts` (INTRO.md data), `script.ts` (the 5-minute timeline). `src/state/SimulationProvider.tsx` holds the reducer and the 1-second `setInterval` that dispatches `tick`. `src/components/` is UI only.
- To check the demo's pacing, run the reducer for N ticks in a test and inspect `state.log`, as `simulation.test.ts` does. Script technician events act on the technician's current job and are skipped if that job was reassigned, so operator actions never break the script.
- A technician is free when they have no request that is `Assigned` or `In progress`. `Waiting for part` doesn't block them. When the operator unassigns a technician, that technician goes into `declinedBy`, so auto-assign won't hand the same request straight back to them.
- A follow-up message from a customer with an open request doesn't create a new request. It gets a status reply on the channel the follow-up came in on. This is how R104 is merged into R101 at seed time.
- One central store (reducer/context or similar) is the single source of truth for requests, technicians, the log and the clock. Components only dispatch actions.
- The 1-second auto-assignment tick is driven by the simulation clock, not by a separate `setInterval` per component.
- Domain rules (queue ordering, free-technician detection, notification fan-out, urgency classification stub) belong in pure functions outside React components, so they can be unit tested.
- Assumptions not given in `INTRO.md` (urgency levels, SLA targets, technician skills/capacity, clock speed) must be stated explicitly in code/UI as assumptions, never presented as supplied facts. The UI lists them in the Assumptions dialog (`ASSUMPTIONS` in `AppHeader.tsx`), so keep that list in sync when rules change.
