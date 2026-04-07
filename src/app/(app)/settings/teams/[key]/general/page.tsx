"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TeamGeneralData {
  name: string;
  key: string;
  icon: string;
  timezone: string;
  estimateType: string;
  emailEnabled: boolean;
  detailedHistory: boolean;
}

const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "GMT-10:00 – Hawaii" },
  { value: "America/Anchorage", label: "GMT-9:00 – Alaska" },
  {
    value: "America/Los_Angeles",
    label: "GMT-7:00 – Pacific Time - Los Angeles",
  },
  { value: "America/Denver", label: "GMT-6:00 – Mountain Time - Denver" },
  { value: "America/Chicago", label: "GMT-5:00 – Central Time - Chicago" },
  { value: "America/New_York", label: "GMT-4:00 – Eastern Time - New York" },
  { value: "America/Sao_Paulo", label: "GMT-3:00 – São Paulo" },
  { value: "Europe/London", label: "GMT+0:00 – London" },
  { value: "Europe/Paris", label: "GMT+1:00 – Paris" },
  { value: "Europe/Berlin", label: "GMT+1:00 – Berlin" },
  { value: "Asia/Dubai", label: "GMT+4:00 – Dubai" },
  { value: "Asia/Kolkata", label: "GMT+5:30 – Kolkata" },
  { value: "Asia/Shanghai", label: "GMT+8:00 – Shanghai" },
  { value: "Asia/Seoul", label: "GMT+9:00 – Seoul" },
  { value: "Asia/Tokyo", label: "GMT+9:00 – Tokyo" },
  { value: "Australia/Sydney", label: "GMT+10:00 – Sydney" },
];

const ESTIMATE_OPTIONS = [
  { value: "none", label: "Not in use" },
  { value: "linear", label: "Linear (1, 2, 3, 4, ...)" },
  { value: "exponential", label: "Exponential (1, 2, 4, 8, ...)" },
  { value: "tshirt", label: "T-shirt (XS, S, M, L, XL)" },
];

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
      }`}
    >
      <span
        className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 mt-8">
      <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
          {description}
        </p>
      )}
    </div>
  );
}

export default function TeamGeneralSettingsPage() {
  const params = useParams();
  const teamKey = params.key as string;
  const [team, setTeam] = useState<TeamGeneralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [estimateType, setEstimateType] = useState("none");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [detailedHistory, setDetailedHistory] = useState(false);

  useEffect(() => {
    fetch(`/api/teams/${teamKey}/settings`)
      .then((res) => res.json())
      .then((data) => {
        const t = data.team;
        setTeam(t);
        setName(t.name);
        setIdentifier(t.key);
        setTimezone(t.timezone || "America/Los_Angeles");
        setEstimateType(t.estimateType || "none");
        setEmailEnabled(t.emailEnabled || false);
        setDetailedHistory(t.detailedHistory || false);
      })
      .finally(() => setLoading(false));
  }, [teamKey]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Team not found
      </div>
    );
  }

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === timezone);

  return (
    <div className="max-w-[720px]">
      <h1 className="mb-6 text-[20px] font-semibold text-[var(--color-text-primary)]">
        General
      </h1>

      {/* ─── Icon & Name ──────────────────────────────────── */}
      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="mb-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
          Icon & Name
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[20px] hover:bg-[var(--color-surface-hover)]"
          >
            {team.icon}
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="mt-4">
          <div className="mb-1 text-[13px] font-medium text-[var(--color-text-secondary)]">
            Identifier
          </div>
          <div className="mb-2 text-[12px] text-[var(--color-text-tertiary)]">
            Used in issue IDs
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* ─── Timezone ─────────────────────────────────────── */}
      <SectionHeader
        title="Timezone"
        description="The timezone should be set as the location where most of your team members reside. All other times referenced by the team will be relative to this timezone setting. For example, if the team uses cycles, each cycle will start at midnight in the specified timezone."
      />

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--color-text-primary)]">
            Timezone
          </span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] outline-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        {selectedTimezone && (
          <div className="mt-1 text-right text-[11px] text-[var(--color-text-tertiary)]">
            {selectedTimezone.label}
          </div>
        )}
      </div>

      {/* ─── Estimates ────────────────────────────────────── */}
      <SectionHeader
        title="Estimates"
        description="Estimates are a great way of communicating the complexity of each issue or to calculate whether a cycle has more room left. Below you can choose how your team estimates issue complexity."
      />

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--color-text-primary)]">
            Issue estimation
          </span>
          <select
            value={estimateType}
            onChange={(e) => setEstimateType(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] outline-none"
          >
            {ESTIMATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Create issues by email ───────────────────────── */}
      <SectionHeader title="Create issues by email" />

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-[var(--color-text-primary)]">
              Create issues by email
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
              Allow creating issues by sending emails to a team-specific address
            </div>
          </div>
          <Toggle
            enabled={emailEnabled}
            onChange={setEmailEnabled}
            label="Create issues by email"
          />
        </div>
        {emailEnabled && (
          <div className="mt-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] text-[var(--color-text-tertiary)]">
            {identifier.toLowerCase()}@team.linear.app
          </div>
        )}
      </div>

      {/* ─── Other ────────────────────────────────────────── */}
      <SectionHeader title="Other" />

      <div className="rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-[var(--color-text-primary)]">
              Enable detailed issue history
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
              Track all changes to issues with audit-level detail
            </div>
          </div>
          <Toggle
            enabled={detailedHistory}
            onChange={setDetailedHistory}
            label="Enable detailed issue history"
          />
        </div>
      </div>
    </div>
  );
}
