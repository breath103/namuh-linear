"use client";

import { EmptyState } from "@/components/empty-state";

export default function TeamBoardPage() {
  return (
    <EmptyState
      title="No issues"
      description="Create issues to see them on the board, organized by status."
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
          aria-label="Board"
        >
          <rect width="6" height="14" x="4" y="5" rx="1" />
          <rect width="6" height="10" x="14" y="7" rx="1" />
        </svg>
      }
      action={{ label: "Create issue" }}
    />
  );
}
