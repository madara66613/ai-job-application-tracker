"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Filter,
  LinkIcon,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  SAMPLE_APPLICATIONS,
  STATUS_OPTIONS,
  STATUS_STYLES,
} from "@/lib/sample-data";
import type {
  AiAssistantResult,
  ApplicationStatus,
  JobApplication,
} from "@/types";

const STORAGE_KEY = "ai-job-application-tracker:v1";

const emptyForm = {
  company: "",
  role: "",
  location: "Warsaw / Remote",
  url: "",
  status: "Saved" as ApplicationStatus,
  deadline: "",
  notes: "",
};

type ApplicationForm = typeof emptyForm;
type FilterStatus = ApplicationStatus | "All";

function formatDate(date: string) {
  if (!date) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function statusCount(applications: JobApplication[], status: ApplicationStatus) {
  return applications.filter((application) => application.status === status).length;
}

export default function Home() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<ApplicationForm>(emptyForm);
  const [aiResult, setAiResult] = useState<AiAssistantResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedApplications = window.localStorage.getItem(STORAGE_KEY);
    const parsedApplications = storedApplications
      ? (JSON.parse(storedApplications) as JobApplication[])
      : SAMPLE_APPLICATIONS;

    // localStorage is browser-only, so this sync happens after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplications(parsedApplications);
    setSelectedId(parsedApplications[0]?.id ?? null);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
  }, [applications, hasLoaded]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus = filter === "All" || application.status === filter;
      const searchableText = [
        application.company,
        application.role,
        application.location,
        application.notes,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus && searchableText.includes(searchQuery.trim().toLowerCase())
      );
    });
  }, [applications, filter, searchQuery]);

  const selectedApplication =
    applications.find((application) => application.id === selectedId) ??
    filteredApplications[0] ??
    applications[0] ??
    null;

  const stats = [
    {
      label: "Total",
      value: applications.length,
      icon: BriefcaseBusiness,
    },
    {
      label: "Applied",
      value: statusCount(applications, "Applied"),
      icon: CheckCircle2,
    },
    {
      label: "Assessment",
      value: statusCount(applications, "Assessment"),
      icon: ClipboardCheck,
    },
    {
      label: "Interview",
      value: statusCount(applications, "Interview"),
      icon: CalendarClock,
    },
  ];

  function updateFormField<T extends keyof ApplicationForm>(
    field: T,
    value: ApplicationForm[T],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function addApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const application: JobApplication = {
      id: crypto.randomUUID(),
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      url: form.url.trim(),
      status: form.status,
      deadline: form.deadline,
      notes: form.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };

    setApplications((currentApplications) => [application, ...currentApplications]);
    setSelectedId(application.id);
    setForm(emptyForm);
    setAiResult(null);
    setAiError(null);
  }

  function updateStatus(id: string, status: ApplicationStatus) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === id
          ? { ...application, status, updatedAt: new Date().toISOString() }
          : application,
      ),
    );
  }

  function removeApplication(id: string) {
    const remainingApplications = applications.filter(
      (application) => application.id !== id,
    );

    setApplications(remainingApplications);
    setSelectedId((currentSelectedId) =>
      currentSelectedId === id
        ? remainingApplications[0]?.id ?? null
        : currentSelectedId,
    );
    setAiResult(null);
  }

  function resetDemoData() {
    setApplications(SAMPLE_APPLICATIONS);
    setSelectedId(SAMPLE_APPLICATIONS[0]?.id ?? null);
    setFilter("All");
    setSearchQuery("");
    setAiResult(null);
    setAiError(null);
  }

  async function generateAiNotes(application: JobApplication) {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ application }),
      });

      if (!response.ok) {
        throw new Error("AI assistant request failed");
      }

      const result = (await response.json()) as AiAssistantResult;
      setAiResult(result);
    } catch {
      setAiError("AI assistant is unavailable. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                AI Job Application Tracker
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Track job applications, deadlines, recruiter notes, and AI prep
                output in one focused workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset demo
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </span>
                    <Icon className="h-4 w-4 text-teal-700" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)_360px] lg:px-8">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-700" />
            <h2 className="text-base font-semibold text-slate-950">
              Add application
            </h2>
          </div>

          <form className="space-y-4" onSubmit={addApplication}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                required
                value={form.company}
                onChange={(event) =>
                  updateFormField("company", event.target.value)
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="Netguru"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <input
                required
                value={form.role}
                onChange={(event) => updateFormField("role", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="Junior AI Engineer"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                value={form.location}
                onChange={(event) =>
                  updateFormField("location", event.target.value)
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="Warsaw / Remote"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Job URL</span>
              <input
                value={form.url}
                onChange={(event) => updateFormField("url", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="https://..."
                type="url"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateFormField("status", event.target.value as ApplicationStatus)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Deadline
                </span>
                <input
                  value={form.deadline}
                  onChange={(event) =>
                    updateFormField("deadline", event.target.value)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  type="date"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateFormField("notes", event.target.value)}
                className="mt-1 min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                placeholder="Paste key requirements or your notes here"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" />
              Add to tracker
            </button>
          </form>
        </aside>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Applications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredApplications.length} visible
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  placeholder="Search"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-slate-500" />
            {(["All", ...STATUS_OPTIONS] as FilterStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`h-9 shrink-0 rounded-lg border px-3 text-sm font-medium transition ${
                  filter === status
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {filteredApplications.map((application) => {
              const styles = STATUS_STYLES[application.status];
              const isSelected = selectedApplication?.id === application.id;

              return (
                <article
                  key={application.id}
                  className={`rounded-lg border p-4 transition ${
                    isSelected
                      ? "border-teal-700 bg-teal-50"
                      : `${styles.border} bg-white hover:border-slate-300 hover:bg-slate-50`
                  }`}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(application.id);
                        setAiResult(null);
                        setAiError(null);
                      }}
                      className="min-w-0 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
                        />
                        <h3 className="truncate text-base font-semibold text-slate-950">
                          {application.role}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {application.company}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {application.location || "Location not set"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-4 w-4" />
                          {formatDate(application.deadline)}
                        </span>
                      </div>
                    </button>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <select
                        value={application.status}
                        onChange={(event) =>
                          updateStatus(
                            application.id,
                            event.target.value as ApplicationStatus,
                          )
                        }
                        className={`h-9 rounded-lg border border-transparent px-2 text-sm font-medium outline-none ${styles.badge}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeApplication(application.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Remove ${application.company} application`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No applications match the current filters.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {selectedApplication ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    {selectedApplication.company}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold leading-7 text-slate-950">
                    {selectedApplication.role}
                  </h2>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[selectedApplication.status].badge}`}
                >
                  {selectedApplication.status}
                </span>
              </div>

              <div className="mt-4 space-y-3 border-y border-slate-200 py-4 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {selectedApplication.location || "Location not set"}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {formatDate(selectedApplication.deadline)}
                </p>
                {selectedApplication.url && (
                  <a
                    href={selectedApplication.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 font-medium text-teal-700 hover:text-teal-800"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Open job post
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="mt-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Notes
                </h3>
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  {selectedApplication.notes || "No notes yet."}
                </p>
              </div>

              <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Sparkles className="h-4 w-4 text-teal-700" />
                      AI assistant
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Source: {aiResult?.source ?? "mock or configured API"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => generateAiNotes(selectedApplication)}
                  disabled={aiLoading}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate prep notes
                </button>

                {aiError && (
                  <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    {aiError}
                  </p>
                )}

                {aiResult && (
                  <div className="mt-4 space-y-4">
                    <AiSection
                      title="Recruiter message"
                      content={aiResult.recruiterMessage}
                    />
                    <AiList title="Key requirements" items={aiResult.requirements} />
                    <AiList title="CV skills" items={aiResult.cvSkills} />
                    <AiList title="Interview tasks" items={aiResult.interviewTasks} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Select an application to see details.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function AiSection({ title, content }: { title: string; content: string }) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">
        {content}
      </p>
    </section>
  );
}

function AiList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-white px-3 py-2 text-sm leading-6 text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
