# AI Job Application Tracker

[![CI](https://github.com/madara66613/ai-job-application-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/madara66613/ai-job-application-tracker/actions/workflows/ci.yml)

A local-first job application tracker built with Next.js and TypeScript. It stores application status, deadlines, and notes in the browser, with validated JSON backups and optional AI-assisted preparation notes. Sample applications are fictional and use example.com links.

![Application tracker](output/playwright/application-tracker-dashboard.png)

## Functionality

- Add applications, update status, search/filter the pipeline, and inspect deadline metrics.
- Store versioned records in `localStorage`, recovering from malformed stored data.
- Export/import versioned JSON backups with runtime validation and a 2 MB import limit.
- Generate preparation notes through `POST /api/ai-assistant`, using an OpenAI-compatible provider or rule-based fallback.

Records stay in the browser. Requesting preparation notes sends the selected application to the Next.js route; an external provider receives it only when credentials are configured. Provider output is normalized before rendering. See [application utilities](src/lib/applications.ts) and [AI integration](src/lib/ai.ts).

## Quick start

Requires Node.js 22+ and npm.

```bash
git clone https://github.com/madara66613/ai-job-application-tracker.git
cd ai-job-application-tracker
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No API key is required for fallback output.

To configure a provider, copy `.env.example` to `.env.local`, set `OPENAI_API_KEY`, and adjust `OPENAI_BASE_URL`/`OPENAI_MODEL` if needed. Restart the server; keep `.env.local` out of Git.

## Tests

```bash
npm run check
```

The CI command runs Oxlint, TypeScript validation, Vitest, and a Next.js build. Tests cover application validation, filtering/metrics, storage recovery, backup validation, fallback generation, and output normalization. [Manual cases](docs/test-cases.md) complement the utility tests.

## Limits

There is no database, authentication, or cross-device synchronization. Browser storage can be cleared; JSON export is the backup mechanism. Provider failures fall back to local output, but no explicit provider timeout/retry is implemented. Automated browser E2E tests are not included.

Stack: Next.js, React, TypeScript, Tailwind CSS, Vitest. No LICENSE file is included.
