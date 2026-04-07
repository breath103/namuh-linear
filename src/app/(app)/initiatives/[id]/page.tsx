"use client";

import { EmptyState } from "@/components/empty-state";
import { InitiativeProjectList } from "@/components/initiative-project-list";
import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LinkedProject {
  id: string;
  name: string;
  status: string;
  icon: string | null;
  slug: string;
  completedIssueCount: number;
  issueCount: number;
}

interface InitiativeDetailResponse {
  initiative: {
    id: string;
    name: string;
    description: string | null;
    status: "active" | "planned" | "completed";
    projectCount: number;
    completedProjectCount: number;
    createdAt: string;
    updatedAt: string;
  };
  projects: LinkedProject[];
}

export default function InitiativeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<InitiativeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/initiatives/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Initiative not found"
        description="This initiative may have been deleted."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-2">
        <button
          type="button"
          onClick={() => router.push("/initiatives")}
          className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          Initiatives
        </button>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {data.initiative.name}
        </h1>
        <InitiativeStatusBadge status={data.initiative.status} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        {data.initiative.description && (
          <div className="border-b border-[var(--color-border)] px-4 py-4">
            <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              {data.initiative.description}
            </p>
          </div>
        )}

        {/* Progress summary */}
        <div className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            Progress
          </span>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{
                  width: `${data.initiative.projectCount > 0 ? Math.round((data.initiative.completedProjectCount / data.initiative.projectCount) * 100) : 0}%`,
                }}
              />
            </div>
            <span className="text-[12px] text-[var(--color-text-tertiary)]">
              {data.initiative.completedProjectCount} /{" "}
              {data.initiative.projectCount} projects completed
            </span>
          </div>
        </div>

        {/* Linked projects */}
        <InitiativeProjectList projects={data.projects} />
      </div>
    </div>
  );
}
