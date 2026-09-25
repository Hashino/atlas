# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MVP for Atlas Industrial Services (fictional). `INTRO.md` is the problem statement and holds the sample dataset (R101–R108, technicians T1–T3). It describes the problem; it is not a feature checklist. The repo has no code yet; the sections below set out the agreed product scope and the architecture to build.

Everything is in **English**: code, identifiers, comments, UI copy, log messages and docs.

The whole app is a **frontend-only simulation**: no backend and no real email/WhatsApp/phone integrations. All data is clearly synthetic.

### Stack

- React + TypeScript (Vite), MUI with a **light theme**.
- Planned commands (update this section once `package.json` exists): `npm install`, `npm run dev`, `npm run build`, `npm run lint`.
- Hosted as a static site on **GitHub Pages**, deployed by a GitHub Actions workflow on push to `main`. Vite uses `base: './'` so the build works under any `/<repo>/` path. Don't use client-side routing that needs server rewrites: the screen toggle is plain app state.

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
- **Customer notifications**: every status change sends an update to the customer **on the same channel the request came in on** (simulated and logged, e.g. "WhatsApp → C02: …").
- **Queue ordering**: the head of the queue (unassigned requests) is always the **oldest request among those with the highest urgency**, i.e. sort by urgency descending, then received time ascending.
- **Auto-assignment** (while the toggle is on): a check runs on a **1-second tick** of the simulation clock. Whenever it finds a free technician (no active request, e.g. right after completing one or after being unassigned), it assigns them the head of the queue.

## Simulation clock and scripted timeline

- The app runs on a **fake clock** that starts at **09:00, 1 October 2026** (Atlas local time, per `INTRO.md`). Every timestamp in the UI and log comes from this clock, never from `Date.now()` directly.
- Initial state is seeded from the `INTRO.md` table, keeping each request's "current record" state (e.g. R102 assigned to T1, R106 assigned to T2 and waiting for a part, R107 still in progress under T3).
- A scripted event timeline covers **5 minutes** of events. It is paced so that **every feature shows up within the first ~2 minutes** (ingest + AI triage, tech update, customer notification, a technician becoming free and receiving the head of the queue). The remaining 3 minutes keep the demo alive.
- Scripted events and operator actions must go through the **same state-mutation path**, so auto-assignment, customer notifications and logging behave the same whoever triggers them.

## Architecture guidelines

- One central store (reducer/context or similar) is the single source of truth for requests, technicians, the log and the clock. Components only dispatch actions.
- The 1-second auto-assignment tick is driven by the simulation clock, not by a separate `setInterval` per component.
- Domain rules (queue ordering, free-technician detection, notification fan-out, urgency classification stub) belong in pure functions outside React components, so they can be unit tested.
- Assumptions not given in `INTRO.md` (urgency levels, SLA targets, technician skills/capacity, clock speed) must be stated explicitly in code/UI as assumptions, never presented as supplied facts.
