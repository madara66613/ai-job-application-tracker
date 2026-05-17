export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Rejected";

export type AiResultSource = "mock" | "openai-compatible";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string;
  status: ApplicationStatus;
  deadline: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiAssistantResult {
  recruiterMessage: string;
  requirements: string[];
  cvSkills: string[];
  interviewTasks: string[];
  source: AiResultSource;
  generatedAt: string;
}
