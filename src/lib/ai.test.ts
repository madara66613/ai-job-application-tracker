import { describe, expect, it } from "vitest";
import { normalizeAiAssistantResult } from "./ai";
import type { JobApplication } from "@/types";

const application: JobApplication = {
  id: "app-1",
  company: "Acme",
  role: "Junior AI Engineer",
  location: "Remote",
  url: "https://example.com/job",
  status: "Assessment",
  deadline: "2026-07-24",
  notes: "TypeScript, LLM workflows, QA documentation",
  createdAt: "2026-07-21T08:00:00.000Z",
  updatedAt: "2026-07-21T08:00:00.000Z",
};

describe("AI assistant normalization", () => {
  it("normalizes mixed provider output into the UI contract", () => {
    const result = normalizeAiAssistantResult(
      {
        recruiterMessage: "  Hello recruiter  ",
        requirements: [" TypeScript ", 123, "", "LLM workflows"],
        cvSkills: "not an array",
        interviewTasks: ["Explain the project"],
      },
      application,
      "openai-compatible",
      "2026-07-21T10:00:00.000Z",
    );

    expect(result).toMatchObject({
      recruiterMessage: "Hello recruiter",
      requirements: ["TypeScript", "LLM workflows"],
      interviewTasks: ["Explain the project"],
      source: "openai-compatible",
      generatedAt: "2026-07-21T10:00:00.000Z",
    });
    expect(result.cvSkills.length).toBeGreaterThan(0);
  });
});
