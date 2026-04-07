interface TriageHeaderProps {
  teamName: string;
  count: number;
}

export function TriageHeader({ teamName, count }: TriageHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-2">
      <div className="flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-status-triage)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <h1 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Triage
        </h1>
      </div>
      <span className="rounded-full bg-[var(--color-status-triage)]/10 px-2 py-0.5 text-[12px] font-medium text-[var(--color-status-triage)]">
        {count} issues to triage
      </span>
    </div>
  );
}
