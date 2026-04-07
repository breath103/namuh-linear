"use client";

import { useEffect, useState } from "react";

interface LabelData {
  id: string;
  name: string;
  color: string;
  description: string | null;
  issueCount: number;
  lastApplied: string | null;
  createdAt: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export default function IssueLabelsPage() {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/labels")
      .then((res) => res.json())
      .then((data) => {
        setLabels(data.labels ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[var(--color-text-primary)]">
          Issue labels
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            New group
          </button>
          <button
            type="button"
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            New label
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="flex h-[32px] items-center border-b border-[var(--color-border)] text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
        <div className="min-w-0 flex-1 px-4">Name</div>
        <div className="w-[200px] shrink-0">Description</div>
        <div className="w-[60px] shrink-0 text-center">Issues</div>
        <div className="w-[100px] shrink-0">Last applied</div>
        <div className="w-[100px] shrink-0">Created</div>
      </div>

      {/* Label rows */}
      {labels.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
          No labels yet. Create labels to categorize issues.
        </div>
      ) : (
        <div>
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex h-[44px] items-center border-b border-[var(--color-border)] text-[13px] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
                <ColorDot color={label.color} />
                <span className="truncate text-[var(--color-text-primary)]">
                  {label.name}
                </span>
              </div>
              <div className="w-[200px] shrink-0 truncate text-[12px] text-[var(--color-text-tertiary)]">
                {label.description || (
                  <span className="italic opacity-50">
                    Add label description...
                  </span>
                )}
              </div>
              <div className="w-[60px] shrink-0 text-center text-[12px] text-[var(--color-text-secondary)]">
                {label.issueCount}
              </div>
              <div className="w-[100px] shrink-0 text-[12px] text-[var(--color-text-tertiary)]">
                {formatDate(label.lastApplied)}
              </div>
              <div className="w-[100px] shrink-0 text-[12px] text-[var(--color-text-tertiary)]">
                {formatDate(label.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
