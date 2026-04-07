import { Avatar } from "@/components/avatar";
import { PriorityIcon } from "@/components/icons/priority-icon";
import { StatusIcon } from "@/components/icons/status-icon";

type StatusCategory =
  | "triage"
  | "backlog"
  | "unstarted"
  | "started"
  | "completed"
  | "canceled";

type PriorityValue = "none" | "urgent" | "high" | "medium" | "low";

interface IssuePropertiesProps {
  status: { name: string; category: StatusCategory; color: string };
  priority: PriorityValue;
  assignee: { name: string; image: string | null } | null;
  labels: { id: string; name: string; color: string }[];
  project: { name: string; icon: string } | null;
}

const priorityNumeric: Record<PriorityValue, 0 | 1 | 2 | 3 | 4> = {
  none: 0,
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
};

const priorityLabel: Record<PriorityValue, string> = {
  none: "No priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-[80px] shrink-0 text-[12px] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  );
}

export function IssueProperties({
  status,
  priority,
  assignee,
  labels,
  project,
}: IssuePropertiesProps) {
  return (
    <div className="space-y-0.5">
      {/* Status */}
      <PropertyRow label="Status">
        <StatusIcon category={status.category} color={status.color} size={14} />
        <span className="text-[13px] text-[var(--color-text-primary)]">
          {status.name}
        </span>
      </PropertyRow>

      {/* Priority */}
      <PropertyRow label="Priority">
        <PriorityIcon priority={priorityNumeric[priority]} size={14} />
        <span className="text-[13px] text-[var(--color-text-primary)]">
          {priorityLabel[priority]}
        </span>
      </PropertyRow>

      {/* Assignee */}
      <PropertyRow label="Assignee">
        {assignee ? (
          <>
            <Avatar
              name={assignee.name}
              src={assignee.image ?? undefined}
              size="sm"
            />
            <span className="text-[13px] text-[var(--color-text-primary)]">
              {assignee.name}
            </span>
          </>
        ) : (
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            No assignee
          </span>
        )}
      </PropertyRow>

      {/* Labels */}
      <PropertyRow label="Labels">
        {labels.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {labels.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[12px] text-[var(--color-text-primary)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            None
          </span>
        )}
      </PropertyRow>

      {/* Project */}
      <PropertyRow label="Project">
        {project ? (
          <span className="text-[13px] text-[var(--color-text-primary)]">
            {project.icon && <span className="mr-1">{project.icon}</span>}
            {project.name}
          </span>
        ) : (
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            Add to project
          </span>
        )}
      </PropertyRow>
    </div>
  );
}
