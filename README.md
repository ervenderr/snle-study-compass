# Nurse Quest

A deployable Next.js study companion with three explicitly separate libraries: Saudi Nursing Licensure Examination (SNLE), Philippine Nurse Licensure Examination (PNLE), and USRN / NCLEX-RN 2026. It is intentionally built around original questions and clinical competency templates—not copied exam or commercial-reviewer material.

## Architecture decision — separate SNLE and PNLE libraries — 2026-08-15

**Data model.** `QuestionTemplate` contains a single tested competency, four choices, one defensible answer, a teaching rationale, category metadata, and several controlled clinical contexts. A `QuestionVariant` is generated from one template plus one context. Every question has a required `track` (`SNLE` or `PNLE`) and is selected only from the active track. `StudyRecord` is persisted in browser `localStorage` by unique question id; `SavedSession` includes its track; and `Players` keeps XP, streaks, and rewards independently per country. The existing single-player storage shape safely migrates to the SNLE player on the next load.

**Service boundary.** Next.js 16 App Router supplies the application structure; the study dashboard is a client component because it uses browser storage and immediate answer feedback. The project uses `output: 'export'`, so it deploys as static optimized files to Vercel or any static host. The Resource Library links to official exam blueprints and legitimate publishers/providers but never imports or reproduces their protected items. No account, server, analytics, or external API is required today.

**Failure handling.** Invalid stored progress or a malformed saved session is ignored; unavailable local storage degrades to a session-only study flow; empty filters fall back to the full bank. Answer state is locked after a choice, preventing a second score for the same variant.

**Dependencies.** `next@16.3.1`, `react@19.2.8`, and `react-dom@19.2.8`; development packages are pinned in `package.json`. Playwright is used for browser E2E coverage at mobile, tablet, and desktop widths. No runtime service dependencies.

**Rollback.** Revert the Next.js project files or redeploy the previous Vercel deployment. There are no migrations or external data writes. The feature flag is not needed because nothing is integrated into an existing product.

**Status: LOCKED.** Re-run the architecture review before adding authentication, a database, shared progress, or question authoring APIs.

## Architecture decision — USRN / NCLEX-RN 2026 library — 2026-08-15

**Data model.** Add a third `Question.track`, `USRN`, with its own eight 2026 NCLEX-RN Client Needs domains: Management of Care, Safety and Infection Prevention and Control, Health Promotion and Maintenance, Psychosocial Integrity, Basic Care and Comfort, Pharmacological and Parenteral Therapies, Reduction of Risk Potential, and Physiological Adaptation. Existing browser progress already keys records by unique question id; USRN ids will use a distinct `USRN-` prefix. `Players` gains one independently persisted USRN XP/streak/reward record. No migration or data deletion is required; old player records safely default the new track.

**Service boundary.** The deployable app receives only original learning questions, rationales, test-plan metadata, and public official references. The user’s PDF-to-Markdown conversions live privately at `Downloads/USRN 2026/markdown/`, outside this Git repository and deployment. They retain filename/page markers for local authoring traceability but are never served, committed, or copied into the public app. The official [2026 NCLEX-RN Test Plan](https://www.ncsbn.org/public-files/2026_RN_Test-Plan_English-F.pdf) is the public blueprint reference.

**Failure handling.** An unavailable local source-note folder does not affect the deployed study app. USRN items with an invalid domain are rejected by content validation. The practice selector filters strictly by track, so no SNLE or PNLE item can appear in a USRN set. The question flow requires an answer before advancing.

**Dependencies and rollback.** No new runtime dependency, account, API, or backend is introduced. A clean code revert removes the USRN track; private Markdown remains on the user’s machine and can simply be ignored. No feature flag is needed for this static personal study app.

**Status: LOCKED.** Author only fresh clinical scenarios from verified concepts; never copy commercial stems, answer options, diagrams, or rationales.

## Architecture decision — private custom flashcards — 2026-08-16

**Data model.** A `CustomFlashcard` has a unique id, a required track (`SNLE`, `PNLE`, or `USRN`), a learner-written front and back, creation date, next due date, review count, and interval in days. Cards are stored under their own browser key, `nurse-quest-custom-flashcards-v1`, separate from progress, saved rounds, and XP. Malformed stored cards are ignored safely.

**Service boundary.** This is a private, browser-only Anki-inspired deck. It needs no account, API, database, or backend deployment. Cards never leave the learner’s browser and are never bundled into the static site.

**Review behavior and failure handling.** A new card is due immediately. “Again” schedules it for ten minutes; “Got it” schedules one day on the first success and doubles the interval afterward, capped at 30 days. Empty front/back fields are rejected. If browser storage is full or unavailable, the card remains usable for the current visit and the app explains that it cannot be retained after leaving. Multiple tabs follow normal browser last-write-wins behavior.

**Rollback.** Reverting the UI leaves the local browser key harmlessly unused. No migration, external write, or feature flag is required.

**Status: LOCKED.** Re-run the architecture review before adding accounts, cloud sync, shared decks, file imports, or AI card generation.

## Architecture decision — authenticated cloud study data — 2026-08-17

**Data model.** Better Auth owns `user`, `session`, `account`, and verification records. The app owns `flashcards`, `study_records`, `players`, and `saved_sessions`, each scoped by the authenticated user id. Flashcards use soft deletion so a deletion syncs safely across devices. Existing browser data is imported once after a learner creates an account; browser storage remains an offline fallback.

**Service boundary.** Vercel continues to host the static frontend at `snle-study-compass.vercel.app`. Its `/api/*` paths reverse-proxy to one Railway API service, so session cookies remain first-party to the Vercel site. Railway runs Better Auth, Hono, and SQLite on a persistent volume. The API is the sole reader/writer of learner data; the original question library stays bundled in the public frontend.

**Authentication.** Launch uses email and password. Passwords are never handled by the study UI beyond the HTTPS request to Better Auth, which hashes them with its default memory-hard algorithm. Sessions use secure, HTTP-only, same-site cookies through the Vercel proxy. Email verification and password recovery require a transactional-email provider configured in Railway before public promotion beyond this initial password-only launch.

**Failure handling.** The app writes locally first and retries cloud sync in the background. A Railway outage never removes the current browser data; the UI reports pending sync. Server writes are parameterized and user-scoped. Authentication attempts are rate-limited. Enable a daily Railway volume backup before relying on the service as the only copy of a learner's data.

**Dependencies.** The isolated API uses `better-auth@1.6.29`, `better-sqlite3@12.11.1`, `hono@4.13.2`, and `@hono/node-server@2.1.1` (all MIT). No database driver or auth code is bundled into the Vercel frontend.

**Rollback.** Disable the Vercel `/api/*` rewrite and the frontend returns to browser-only storage. The Railway volume is retained; restoring a backup or redeploying a prior API image does not modify the question library. Do not delete the volume as part of a rollback.

**Security gate.** CONDITIONAL until a transactional-email provider and daily backup are configured. Railway secrets, the Vercel rewrite, rate limits, and production headers must be verified after every auth change. Never put patient-identifiable information into cards.

## Content guardrails

- Question stems and rationales are original learning material, not official exam items.
- SNLE forms follow the SCFHS blueprint target: Fundamentals 20%, Adult Nursing 40%, Maternal–Child Nursing 30%, Management & Leadership 10% (allowing the SCFHS stated variation).
- PNLE forms are organized separately under the PRC’s five Nursing Practice areas. Selecting PNLE cannot draw a Saudi item, and selecting SNLE cannot draw a Philippine item.
- USRN forms are organized under the eight 2026 NCLEX-RN Client Needs domains. Selecting USRN cannot draw a Saudi or Philippine item.
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
