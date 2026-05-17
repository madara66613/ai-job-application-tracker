import type { ApplicationStatus, JobApplication } from "@/types";

export const STATUS_OPTIONS: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

export const STATUS_STYLES: Record<
  ApplicationStatus,
  { badge: string; border: string; dot: string }
> = {
  Saved: {
    badge: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  Applied: {
    badge: "bg-sky-100 text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  Assessment: {
    badge: "bg-amber-100 text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Interview: {
    badge: "bg-violet-100 text-violet-800",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  Offer: {
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rejected: {
    badge: "bg-rose-100 text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export const SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: "sample-blazity",
    company: "Blazity",
    role: "Junior AI Engineer",
    location: "Warsaw / Remote",
    url: "https://example.com/blazity-junior-ai-engineer",
    status: "Assessment",
    deadline: "2026-05-24",
    notes:
      "Next.js, TypeScript, LLM workflows, prompt engineering, OpenAI/Anthropic APIs, AI-first product mindset.",
    createdAt: "2026-05-10T08:00:00.000Z",
    updatedAt: "2026-05-13T12:30:00.000Z",
  },
  {
    id: "sample-comscore",
    company: "Comscore",
    role: "Manual Tester",
    location: "Warsaw",
    url: "https://example.com/comscore-manual-tester",
    status: "Applied",
    deadline: "2026-05-28",
    notes:
      "Manual testing, test cases, bug reports, attention to detail, REST API basics, SDLC.",
    createdAt: "2026-05-11T10:15:00.000Z",
    updatedAt: "2026-05-11T10:15:00.000Z",
  },
  {
    id: "sample-deloitte",
    company: "Deloitte",
    role: "Junior Marketing Automation Developer",
    location: "Remote Poland",
    url: "https://example.com/deloitte-marketing-automation",
    status: "Saved",
    deadline: "2026-06-01",
    notes:
      "CRM, Salesforce Marketing Cloud, Braze, business processes, segmentation, SQL basics, documentation.",
    createdAt: "2026-05-12T14:20:00.000Z",
    updatedAt: "2026-05-12T14:20:00.000Z",
  },
];
