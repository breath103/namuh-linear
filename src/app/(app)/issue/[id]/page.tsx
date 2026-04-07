"use client";

import { IssueProperties } from "@/components/issue-properties";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface IssueDetail {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: "none" | "urgent" | "high" | "medium" | "low";
  state: {
    id: string;
    name: string;
    category:
      | "triage"
      | "backlog"
      | "unstarted"
      | "started"
      | "completed"
      | "canceled";
    color: string;
  } | null;
  assignee: { name: string; image: string | null } | null;
  creator: { name: string; image: string | null } | null;
  team: { id: string; name: string; key: string };
  project: { id: string; name: string; icon: string } | null;
  labels: { name: string; color: string }[];
  comments: {
    id: string;
    body: string;
    user: { name: string; image: string | null };
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssue() {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setIssue(json);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchIssue();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Issue not found
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header bar */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-6 py-2">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            {issue.identifier}
          </span>
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            {issue.team.name}
          </span>
        </div>

        {/* Title */}
        <div className="px-12 pt-10 pb-4">
          <h1 className="text-[24px] font-semibold leading-tight text-[var(--color-text-primary)]">
            {issue.title}
          </h1>
        </div>

        {/* Description */}
        <div className="flex-1 px-12 pb-8">
          {issue.description ? (
            <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-[var(--color-text-primary)]">
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>
          ) : (
            <p className="text-[15px] text-[var(--color-text-secondary)]">
              Add a description...
            </p>
          )}
        </div>

        {/* Activity / Comments section */}
        <div className="border-t border-[var(--color-border)] px-12 py-6">
          <h2 className="mb-4 text-[13px] font-medium text-[var(--color-text-secondary)]">
            Activity
          </h2>

          {issue.comments.length > 0 ? (
            <div className="space-y-4">
              {issue.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-medium text-white">
                    {c.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {c.user.name}
                      </span>
                      <span className="text-[12px] text-[var(--color-text-secondary)]">
                        {formatRelativeDate(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--color-text-primary)]">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              No activity yet
            </p>
          )}

          {/* Comment composer */}
          <div className="mt-6">
            <textarea
              placeholder="Leave a comment..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Properties sidebar */}
      <div className="w-[260px] shrink-0 border-l border-[var(--color-border)] p-4">
        <div className="mb-3 flex items-center">
          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Properties
          </span>
        </div>
        {issue.state && (
          <IssueProperties
            status={{
              name: issue.state.name,
              category: issue.state.category,
              color: issue.state.color,
            }}
            priority={issue.priority}
            assignee={issue.assignee}
            labels={issue.labels.map((l, i) => ({
              id: String(i),
              name: l.name,
              color: l.color,
            }))}
            project={issue.project}
          />
        )}

        {/* Metadata */}
        <div className="mt-6 space-y-1.5 border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-secondary)]">Created</span>
            <span className="text-[var(--color-text-primary)]">
              {formatRelativeDate(issue.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-secondary)]">Updated</span>
            <span className="text-[var(--color-text-primary)]">
              {formatRelativeDate(issue.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
