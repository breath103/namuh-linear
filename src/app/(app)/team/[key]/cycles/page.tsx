"use client";

import { EmptyState } from "@/components/empty-state";

export default function TeamCyclesPage() {
  return (
    <EmptyState
      title="No active cycle"
      description="Cycles are a great way to manage iterative development. Enable cycles in team settings to get started."
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
    />
  );
}
