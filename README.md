# SNLE Study Compass

A deployable Next.js study companion for the Saudi Nursing Licensure Examination (SNLE). It is intentionally built around original questions and clinical competency templates—not copied exam or commercial-reviewer material.

## Architecture decision — Next.js conversion — 2026-08-15

**Data model.** `QuestionTemplate` contains a single tested competency, four choices, one defensible answer, a teaching rationale, category metadata, and several controlled clinical contexts. A `QuestionVariant` is generated from one template plus one context. `StudyRecord` is persisted in browser `localStorage` and records answer, timestamp, and alternate-form state by variant id. `SavedSession` stores the in-progress question and selected study filters, so a learner can resume after closing the browser. `Player` stores XP, correct-answer streaks, and one-time rewards; it is motivational study feedback, not an exam credential.

**Service boundary.** Next.js 16 App Router supplies the application structure; the study dashboard is a client component because it uses browser storage and immediate answer feedback. The project uses `output: 'export'`, so it deploys as static optimized files to Vercel or any static host. The Resource Library links to official exam blueprints and legitimate publishers/providers but never imports or reproduces their protected items. The PNLE resource track remains separate from the Saudi-specific SNLE bank. No account, server, analytics, or external API is required today.

**Failure handling.** Invalid stored progress or a malformed saved session is ignored; unavailable local storage degrades to a session-only study flow; empty filters fall back to the full bank. Answer state is locked after a choice, preventing a second score for the same variant.

**Dependencies.** `next@16.3.1`, `react@19.2.8`, and `react-dom@19.2.8`; development packages are pinned in `package.json`. Playwright is used for browser E2E coverage at mobile, tablet, and desktop widths. No runtime service dependencies.

**Rollback.** Revert the Next.js project files or redeploy the previous Vercel deployment. There are no migrations or external data writes. The feature flag is not needed because nothing is integrated into an existing product.

**Status: LOCKED.** Re-run the architecture review before adding authentication, a database, shared progress, or question authoring APIs.

## Content guardrails

- Question stems and rationales are original learning material, not official exam items.
- The target weighting follows the SCFHS SNLE blueprint: Fundamentals 20%, Adult Nursing 40%, Maternal–Child Nursing 30%, Management & Leadership 10% (allowing the SCFHS stated variation).
- Study material supports revision only and does not replace local policy, clinical supervision, or current professional guidance.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

The simplest production path is Vercel: import this folder’s Git repository in the Vercel dashboard, leave the detected Next.js settings in place, and deploy. Preview deployments are then created for future branches or pull requests. The project is also a Next.js static export, so `npm run build` creates `out/` for any static host.

No account or environment variables are required for the current version. When cross-device progress or login is added, switch from local browser storage to an authenticated backend before storing learner data.
