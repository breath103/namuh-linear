"use client";

import { EmptyState } from "@/components/empty-state";

export default function ProjectsPage() {
  return (
    <EmptyState
      title="No projects"
      description="Projects are time-bound deliverables that group issues across teams. Create one to start tracking progress."
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
          aria-label="Projects"
        >
          <path d="M2 17 12 22 22 17" />
          <path d="M2 12 12 17 22 12" />
          <path d="M12 2 2 7 12 12 22 7Z" />
        </svg>
      }
      action={{ label: "Create project" }}
    />
  );
}
