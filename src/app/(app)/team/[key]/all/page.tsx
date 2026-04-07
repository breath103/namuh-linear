"use client";

import { EmptyState } from "@/components/empty-state";

export default function TeamIssuesPage() {
  return (
    <EmptyState
      title="No issues"
      description="Create your first issue to start tracking work for your team."
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
          aria-label="Issues"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      }
      action={{ label: "Create issue" }}
    />
  );
}
