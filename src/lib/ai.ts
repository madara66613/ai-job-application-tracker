import type { AiAssistantResult, JobApplication } from "@/types";

function splitNotes(notes: string) {
  return notes
    .split(/[,.;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function createMockAiResult(
  application: JobApplication,
): AiAssistantResult {
  const keywords = splitNotes(application.notes);
  const focusAreas =
    keywords.length > 0
      ? keywords
      : ["communication", "fast learning", "documentation", "ownership"];

  return {
    recruiterMessage: `Hi, I am interested in the ${application.role} role at ${application.company}. I am building practical projects around AI, automation, QA workflows, and application tracking, and I would be happy to discuss how my learning speed and hands-on portfolio can support your team.`,
    requirements: focusAreas.slice(0, 4).map((item) => `Experience or interest in ${item}`),
    cvSkills: [
      "Next.js and TypeScript fundamentals",
      "Structured documentation and QA-style thinking",
      "AI-assisted workflows and prompt iteration",
      "Business process tracking with clear statuses and notes",
    ],
    interviewTasks: [
      `Prepare a 60-second explanation of why ${application.company} fits your goals.`,
      `Review the most important topics for ${application.role}.`,
      "Create 3 examples from this portfolio project that show practical learning.",
      "Write 5 questions for the recruiter about team workflow, onboarding, and expectations.",
    ],
    source: "mock",
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(application: JobApplication) {
  return `
You are an assistant helping a junior candidate prepare for a job application.

Return only valid JSON with this exact shape:
{
  "recruiterMessage": "short professional message",
  "requirements": ["requirement 1", "requirement 2", "requirement 3", "requirement 4"],
  "cvSkills": ["skill 1", "skill 2", "skill 3", "skill 4"],
  "interviewTasks": ["task 1", "task 2", "task 3", "task 4"]
}

Job application:
Company: ${application.company}
Role: ${application.role}
Location: ${application.location}
Status: ${application.status}
Deadline: ${application.deadline || "Not provided"}
Notes: ${application.notes || "No notes"}
`.trim();
}

export async function generateOpenAiCompatibleResult(
  application: JobApplication,
): Promise<AiAssistantResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return createMockAiResult(application);
  }

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You generate concise, practical job application preparation notes for a junior candidate. Return strict JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(application),
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content;

  if (typeof rawContent !== "string") {
    throw new Error("AI provider returned an unexpected response shape");
  }

  const parsed = JSON.parse(rawContent) as Omit<
    AiAssistantResult,
    "source" | "generatedAt"
  >;

  return {
    recruiterMessage: parsed.recruiterMessage,
    requirements: parsed.requirements,
    cvSkills: parsed.cvSkills,
    interviewTasks: parsed.interviewTasks,
    source: "openai-compatible",
    generatedAt: new Date().toISOString(),
  };
}
