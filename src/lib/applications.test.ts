import { describe, expect, it } from "vitest";
import {
  createApplicationFromForm,
  emptyApplicationForm,
  filterApplications,
  getApplicationMetrics,
  parseStoredApplications,
} from "./applications";
import type { JobApplication } from "@/types";

const baseApplication: JobApplication = {
  id: "app-1",
  company: "Acme",
  role: "Junior QA Engineer",
  location: "Warsaw",
  url: "https://example.com/job",
  status: "Applied",
  deadline: "2026-07-24",
  notes: "Manual testing, CRM, bug reports",
  createdAt: "2026-07-21T08:00:00.000Z",
  updatedAt: "2026-07-21T08:00:00.000Z",
};

describe("application utilities", () => {
  it("creates a trimmed application from valid form data", () => {
    const application = createApplicationFromForm(
      {
        ...emptyApplicationForm,
        company: "  Acme  ",
        role: "  Junior QA Engineer  ",
        notes: "  Test cases  ",
      },
      {
        id: "new-app",
        now: "2026-07-21T10:00:00.000Z",
      },
    );

    expect(application).toMatchObject({
      id: "new-app",
      company: "Acme",
      role: "Junior QA Engineer",
      notes: "Test cases",
      createdAt: "2026-07-21T10:00:00.000Z",
    });
  });

  it("rejects whitespace-only required fields", () => {
    const application = createApplicationFromForm(
      {
        ...emptyApplicationForm,
        company: "   ",
        role: "Manual Tester",
      },
      {
        id: "invalid-app",
        now: "2026-07-21T10:00:00.000Z",
      },
    );

    expect(application).toBeNull();
  });

  it("falls back when stored applications are not valid JSON", () => {
    expect(parseStoredApplications("not json", [baseApplication])).toEqual([
      baseApplication,
    ]);
  });

  it("filters by status and searchable notes", () => {
    const rejectedApplication: JobApplication = {
      ...baseApplication,
      id: "app-2",
      company: "Globex",
      status: "Rejected",
      notes: "Different keyword",
    };

    const result = filterApplications(
      [baseApplication, rejectedApplication],
      "Applied",
      "crm",
    );

    expect(result).toEqual([baseApplication]);
  });

  it("calculates active, due soon, and overdue metrics", () => {
    const applications: JobApplication[] = [
      baseApplication,
      {
        ...baseApplication,
        id: "app-2",
        status: "Interview",
        deadline: "2026-07-20",
      },
      {
        ...baseApplication,
        id: "app-3",
        status: "Offer",
        deadline: "2026-07-22",
      },
    ];

    expect(
      getApplicationMetrics(applications, new Date("2026-07-21T10:00:00")),
    ).toEqual({
      total: 3,
      active: 2,
      dueSoon: 1,
      overdue: 1,
    });
  });
});
