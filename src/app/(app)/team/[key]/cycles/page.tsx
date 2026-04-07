"use client";

import { CycleProgressBar } from "@/components/cycle-progress-bar";
import { CycleRow } from "@/components/cycle-row";
import { CycleSection } from "@/components/cycle-section";
import { EmptyState } from "@/components/empty-state";
import { categorizeCycles, formatCycleDate } from "@/lib/cycle-utils";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface CycleData {
  id: string;
  name: string | null;
  number: number;
  teamId: string;
  startDate: string;
  endDate: string;
  autoRollover: boolean;
  issueCount: number;
  completedIssueCount: number;
}

interface CyclesResponse {
  team: { id: string; name: string; key: string };
  cycles: CycleData[];
}

export default function TeamCyclesPage() {
  const params = useParams<{ key: string }>();
  const [data, setData] = useState<CyclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchCycles = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${params.key}/cycles`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [params.key]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const handleCreateCycle = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;
      const name = (formData.get("name") as string) || undefined;

      const res = await fetch(`/api/teams/${params.key}/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, name }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        fetchCycles();
      }
    },
    [params.key, fetchCycles],
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!data || data.cycles.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
          <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Cycles
          </h1>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
          >
            New cycle
          </button>
        </div>
        {showCreateForm ? (
          <CreateCycleForm
            onSubmit={handleCreateCycle}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : (
          <EmptyState
            title="No active cycle"
            description="Cycles are a great way to manage iterative development. Focus your team over time-boxed windows to ship faster."
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b6f76"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="Cycles"
              >
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 22v-6h6" />
                <path d="M22 11.5A10 10 0 0 0 3.2 7.2" />
                <path d="M2 12.5a10 10 0 0 0 18.8 4.3" />
              </svg>
            }
            action={{
              label: "Create cycle",
              onClick: () => setShowCreateForm(true),
            }}
          />
        )}
      </div>
    );
  }

  const { current, upcoming, past } = categorizeCycles(data.cycles);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Cycles
          </h1>
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {data.cycles.length} cycles
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
        >
          New cycle
        </button>
      </div>

      {showCreateForm && (
        <CreateCycleForm
          onSubmit={handleCreateCycle}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Cycle lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Current cycle - highlighted */}
        {current && (
          <div>
            <div className="flex h-[36px] items-center border-b border-[var(--color-border)] bg-[var(--color-content-bg)] px-4">
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                Current Cycle
              </span>
            </div>
            <CycleRow cycle={current} teamKey={params.key} />
          </div>
        )}

        <CycleSection title="Upcoming" cycles={upcoming} teamKey={params.key} />

        <CycleSection title="Past Cycles" cycles={past} teamKey={params.key} />
      </div>
    </div>
  );
}

function CreateCycleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  // Default: start today, end in 2 weeks
  const today = new Date().toISOString().split("T")[0];
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <form
      onSubmit={onSubmit}
      className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-4 py-3"
    >
      <div className="flex flex-col gap-3">
        <input
          name="name"
          type="text"
          placeholder="Cycle name (optional)"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-content-bg)] px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            Start
            <input
              name="startDate"
              type="date"
              defaultValue={today}
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-content-bg)] px-2 py-1 text-[13px] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            End
            <input
              name="endDate"
              type="date"
              defaultValue={twoWeeks}
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-content-bg)] px-2 py-1 text-[13px] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:opacity-90"
          >
            Create cycle
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
