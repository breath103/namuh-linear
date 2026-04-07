"use client";

import { EmptyState } from "@/components/empty-state";
import { ProjectRow } from "@/components/project-row";
import { useEffect, useState } from "react";

interface ProjectData {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
  status: "planned" | "started" | "paused" | "completed" | "canceled";
  priority: "none" | "urgent" | "high" | "medium" | "low";
  health: string;
  lead: { name: string; image?: string | null } | null;
  targetDate: string | null;
  progress: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (projects.length === 0) {
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[var(--color-border)] px-4 py-2">
        <h1 className="mr-4 text-[15px] font-medium text-[var(--color-text-primary)]">
          Projects
        </h1>
        <div className="flex items-center gap-0.5">
          <span className="rounded-md bg-[var(--color-surface-active)] px-2.5 py-1 text-[13px] text-[var(--color-text-primary)]">
            All projects
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-[var(--color-text-secondary)]">
          {projects.length} projects
        </span>
      </div>

      {/* Table header */}
      <div className="flex h-[32px] items-center border-b border-[var(--color-border)] px-4 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
        <div className="min-w-0 flex-1">Name</div>
        <div className="w-[120px] shrink-0">Health</div>
        <div className="w-[60px] shrink-0 text-center">Priority</div>
        <div className="w-[60px] shrink-0 text-center">Lead</div>
        <div className="w-[80px] shrink-0">Target date</div>
        <div className="w-[70px] shrink-0">Status</div>
      </div>

      {/* Project rows */}
      <div className="flex-1 overflow-y-auto">
        {projects.map((p) => (
          <ProjectRow
            key={p.id}
            name={p.name}
            icon={p.icon}
            slug={p.slug}
            status={p.status}
            priority={p.priority}
            health={p.health}
            lead={
              p.lead
                ? { name: p.lead.name, image: p.lead.image ?? undefined }
                : null
            }
            targetDate={p.targetDate}
            progress={p.progress}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center border-t border-[var(--color-border)] px-4 py-1.5 text-[12px] text-[var(--color-text-secondary)]">
        {projects.length} projects
      </div>
    </div>
  );
}
