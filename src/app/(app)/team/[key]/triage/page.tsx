"use client";

import { EmptyState } from "@/components/empty-state";

export default function TeamTriagePage() {
  return (
    <EmptyState
      title="No issues to triage"
      description="When new issues are created, they'll appear here for review. Accept them into your workflow or decline."
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
          aria-label="Triage"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      }
      action={{ label: "Create triage issue" }}
    />
  );
}
