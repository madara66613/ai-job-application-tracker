# AI Job Application Tracker

A small portfolio project for tracking job applications, deadlines, statuses, recruiter notes, and AI-assisted interview preparation.

The project is designed as a practical mini CRM for junior job search workflows. It demonstrates Next.js, TypeScript, client-side state management, localStorage persistence, API route handling, mock AI fallback logic, and QA documentation.

## Features

- Add job applications with company, role, location, URL, status, deadline, and notes
- Filter applications by status
- Search across company, role, location, and notes
- Store data in localStorage
- View application details in a focused side panel
- Generate AI preparation notes:
  - short recruiter message
  - key requirements
  - CV skills to highlight
  - interview preparation tasks
- Works without an API key by using a mock AI response
- Optional OpenAI-compatible API route
- QA test cases and bug report template included in `/docs`

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- React
- localStorage
- OpenAI-compatible chat completions endpoint

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Optional AI Setup

The app works without an API key. In that case, the API route returns a mock AI response.

To use a real OpenAI-compatible provider, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Then add your values:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Restart the development server after changing environment variables.

## Project Structure

```text
src/
  app/
    api/ai-assistant/route.ts  API route with real/mock AI logic
    globals.css               Global styles
    layout.tsx                 App metadata and layout
    page.tsx                   Main tracker UI
  lib/
    ai.ts                      AI prompt, mock result, provider call
    sample-data.ts             Demo applications and status styles
  types.ts                     Shared TypeScript types
docs/
  test-cases.md                Manual QA test cases
  bug-report-template.md       Bug report template
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Portfolio Notes

This project is relevant for junior AI, QA, PM, CRM, support, and automation roles because it combines:

- AI-assisted workflow design
- application pipeline/status tracking
- CRM-like data organization
- QA documentation
- clear README and project structure
- practical TypeScript and API route usage

## CV Description

AI Job Application Tracker — built a Next.js and TypeScript mini CRM for managing job applications, deadlines, statuses, and recruiter notes. Added an AI assistant API route with mock fallback to generate recruiter messages, requirements, CV skills, and interview tasks. Documented QA test cases and bug report workflow.
