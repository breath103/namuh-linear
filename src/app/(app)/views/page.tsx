"use client";

import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { useCallback, useEffect, useState } from "react";

interface ViewData {
  id: string;
  name: string;
  layout: "list" | "board" | "timeline";
  isPersonal: boolean;
  owner: { name: string; image: string | null } | null;
  createdAt: string;
}

function LayoutIcon({ layout }: { layout: "list" | "board" | "timeline" }) {
  if (layout === "board") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Board layout"
      >
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="10" rx="1" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="List layout"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ViewRow({ view }: { view: ViewData }) {
  return (
    <div className="flex h-[40px] items-center border-b border-[var(--color-border)] px-4 text-[13px] transition-colors hover:bg-[var(--color-surface-hover)]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-[var(--color-text-secondary)]">
          <LayoutIcon layout={view.layout} />
        </span>
        <span className="truncate text-[var(--color-text-primary)]">
          {view.name}
        </span>
      </div>
      <div className="w-[120px] shrink-0">
        {view.owner && (
          <div className="flex items-center gap-1.5">
            <Avatar
              name={view.owner.name}
              src={view.owner.image ?? undefined}
              size="sm"
            />
            <span className="truncate text-[12px] text-[var(--color-text-secondary)]">
              {view.owner.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateViewModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), layout, isPersonal: true }),
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[400px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 shadow-xl">
        <h2 className="mb-3 text-[14px] font-medium text-[var(--color-text-primary)]">
          Create view
        </h2>
        <input
          type="text"
          placeholder="View name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
          // biome-ignore lint/a11y/noAutofocus: modal input should auto-focus for UX
          autoFocus
        />
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setLayout("list")}
            className={`rounded-md px-3 py-1 text-[12px] ${
              layout === "list"
                ? "bg-[var(--color-surface-active)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setLayout("board")}
            className={`rounded-md px-3 py-1 text-[12px] ${
              layout === "board"
                ? "bg-[var(--color-surface-active)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Board
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ViewsPage() {
  const [views, setViews] = useState<ViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"issues" | "projects">("issues");
  const [showCreate, setShowCreate] = useState(false);

  const fetchViews = useCallback(async () => {
    try {
      const res = await fetch("/api/views");
      if (res.ok) {
        const data = await res.json();
        setViews(data.views ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  const personalViews = views.filter((v) => v.isPersonal);
  const sharedViews = views.filter((v) => !v.isPersonal);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[var(--color-border)] px-4 py-2">
        <h1 className="mr-4 text-[15px] font-medium text-[var(--color-text-primary)]">
          Views
        </h1>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-active={activeTab === "issues"}
            onClick={() => setActiveTab("issues")}
            className={`rounded-md px-2.5 py-1 text-[13px] ${
              activeTab === "issues"
                ? "bg-[var(--color-surface-active)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Issues
          </button>
          <button
            type="button"
            data-active={activeTab === "projects"}
            onClick={() => setActiveTab("projects")}
            className={`rounded-md px-2.5 py-1 text-[13px] ${
              activeTab === "projects"
                ? "bg-[var(--color-surface-active)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Projects
          </button>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
          aria-label="Create view"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>

      {views.length === 0 ? (
        <EmptyState
          title="No views"
          description="Views are saved filter configurations that let you quickly access commonly used issue or project lists."
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
              aria-label="Views"
            >
              <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" />
              <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            </svg>
          }
          action={{
            label: "Create view",
            onClick: () => setShowCreate(true),
          }}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Table header */}
          <div className="flex h-[32px] items-center border-b border-[var(--color-border)] px-4 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            <div className="min-w-0 flex-1">Name</div>
            <div className="w-[120px] shrink-0">Owner</div>
          </div>

          {/* Personal views section */}
          {personalViews.length > 0 && (
            <>
              <div className="flex items-center px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                <span>Personal views</span>
                <span className="ml-1.5 text-[10px] font-normal normal-case text-[var(--color-text-tertiary)]">
                  — Only visible to you
                </span>
              </div>
              {personalViews.map((v) => (
                <ViewRow key={v.id} view={v} />
              ))}
            </>
          )}

          {/* Shared views section */}
          {sharedViews.length > 0 && (
            <>
              <div className="flex items-center px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                Shared views
              </div>
              {sharedViews.map((v) => (
                <ViewRow key={v.id} view={v} />
              ))}
            </>
          )}
        </div>
      )}

      {showCreate && (
        <CreateViewModal
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchViews()}
        />
      )}
    </div>
  );
}
