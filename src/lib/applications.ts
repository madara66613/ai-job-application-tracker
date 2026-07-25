import { STATUS_OPTIONS } from "./sample-data";
import type { ApplicationStatus, JobApplication } from "@/types";

export const STORAGE_KEY = "ai-job-application-tracker:v1";
export const BACKUP_VERSION = 1;

export interface ApplicationsBackup {
  app: "ai-job-application-tracker";
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  applications: JobApplication[];
}

export type BackupParseResult =
  | { ok: true; applications: JobApplication[]; exportedAt: string }
  | { ok: false; error: string };

export const emptyApplicationForm = {
  company: "",
  role: "",
  location: "Warsaw / Remote",
  url: "",
  status: "Saved" as ApplicationStatus,
  deadline: "",
  notes: "",
};

export type ApplicationForm = typeof emptyApplicationForm;
export type FilterStatus = ApplicationStatus | "All";

const ACTIVE_STATUSES = new Set<ApplicationStatus>([
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
]);
const DAY_MS = 24 * 60 * 60 * 1000;

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (STATUS_OPTIONS as readonly string[]).includes(value)
  );
}

export function isJobApplication(value: unknown): value is JobApplication {
  if (!value || typeof value !== "object") {
    return false;
  }

  const application = value as Record<string, unknown>;

  return (
    typeof application.id === "string" &&
    typeof application.company === "string" &&
    typeof application.role === "string" &&
    typeof application.location === "string" &&
    typeof application.url === "string" &&
    isApplicationStatus(application.status) &&
    typeof application.deadline === "string" &&
    typeof application.notes === "string" &&
    typeof application.createdAt === "string" &&
    typeof application.updatedAt === "string"
  );
}

export function parseStoredApplications(
  rawValue: string | null,
  fallbackApplications: JobApplication[],
) {
  if (!rawValue) {
    return fallbackApplications;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return fallbackApplications;
    }

    return parsedValue.filter(isJobApplication);
  } catch {
    return fallbackApplications;
  }
}

export function createApplicationsBackup(
  applications: JobApplication[],
  exportedAt = new Date().toISOString(),
) {
  const backup: ApplicationsBackup = {
    app: "ai-job-application-tracker",
    version: BACKUP_VERSION,
    exportedAt,
    applications,
  };

  return JSON.stringify(backup, null, 2);
}

export function parseApplicationsBackup(rawValue: string): BackupParseResult {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }

  if (!parsedValue || typeof parsedValue !== "object") {
    return { ok: false, error: "This file is not a tracker backup." };
  }

  const backup = parsedValue as Record<string, unknown>;

  if (
    backup.app !== "ai-job-application-tracker" ||
    backup.version !== BACKUP_VERSION
  ) {
    return {
      ok: false,
      error: "This backup format is not supported.",
    };
  }

  if (
    typeof backup.exportedAt !== "string" ||
    !Array.isArray(backup.applications) ||
    !backup.applications.every(isJobApplication)
  ) {
    return {
      ok: false,
      error: "The backup contains invalid application data.",
    };
  }

  return {
    ok: true,
    applications: backup.applications,
    exportedAt: backup.exportedAt,
  };
}

export function createApplicationFromForm(
  form: ApplicationForm,
  options: { id: string; now: string },
): JobApplication | null {
  const company = form.company.trim();
  const role = form.role.trim();

  if (!company || !role) {
    return null;
  }

  return {
    id: options.id,
    company,
    role,
    location: form.location.trim(),
    url: form.url.trim(),
    status: form.status,
    deadline: form.deadline,
    notes: form.notes.trim(),
    createdAt: options.now,
    updatedAt: options.now,
  };
}

export function filterApplications(
  applications: JobApplication[],
  filter: FilterStatus,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return applications.filter((application) => {
    const matchesStatus = filter === "All" || application.status === filter;

    if (!matchesStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      application.company,
      application.role,
      application.location,
      application.notes,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

export function countApplicationsByStatus(
  applications: JobApplication[],
  status: ApplicationStatus,
) {
  return applications.filter((application) => application.status === status).length;
}

export function getApplicationMetrics(
  applications: JobApplication[],
  now = new Date(),
) {
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const soonEnd = todayStart + DAY_MS * 7;

  let active = 0;
  let dueSoon = 0;
  let overdue = 0;

  for (const application of applications) {
    if (!ACTIVE_STATUSES.has(application.status)) {
      continue;
    }

    active += 1;

    if (!application.deadline) {
      continue;
    }

    const deadline = new Date(`${application.deadline}T23:59:59`);

    if (Number.isNaN(deadline.getTime())) {
      continue;
    }

    const deadlineTime = deadline.getTime();

    if (deadlineTime < todayStart) {
      overdue += 1;
    } else if (deadlineTime <= soonEnd) {
      dueSoon += 1;
    }
  }

  return {
    total: applications.length,
    active,
    dueSoon,
    overdue,
  };
}
