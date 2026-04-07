interface LinkedProject {
  id: string;
  name: string;
  status: string;
  icon: string | null;
  completedIssueCount: number;
  issueCount: number;
}

interface InitiativeProjectListProps {
  projects: LinkedProject[];
}

export function InitiativeProjectList({
  projects,
}: InitiativeProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
        No linked projects
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-[36px] items-center border-b border-[var(--color-border)] bg-[var(--color-content-bg)] px-4">
        <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
          Projects
        </span>
        <span className="ml-2 text-[12px] text-[var(--color-text-tertiary)]">
          {projects.length}
        </span>
      </div>
      {projects.map((project) => {
        const percent =
          project.issueCount > 0
            ? Math.round(
                (project.completedIssueCount / project.issueCount) * 100,
              )
            : 0;

        return (
          <a
            key={project.id}
            href={`/project/${project.id}`}
            className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-2.5 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <span className="text-[14px]">{project.icon ?? "📦"}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--color-text-primary)]">
              {project.name}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[12px] text-[var(--color-text-secondary)]">
                {percent}%
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
