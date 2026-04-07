type StatusCategory =
  | "triage"
  | "backlog"
  | "unstarted"
  | "started"
  | "completed"
  | "canceled";

interface StatusIconProps {
  category: StatusCategory;
  color?: string;
  size?: number;
  className?: string;
}

const defaultColors: Record<StatusCategory, string> = {
  triage: "var(--color-status-triage)",
  backlog: "var(--color-status-backlog)",
  unstarted: "var(--color-status-unstarted)",
  started: "var(--color-status-started)",
  completed: "var(--color-status-completed)",
  canceled: "var(--color-status-canceled)",
};

const labels: Record<StatusCategory, string> = {
  triage: "Triage",
  backlog: "Backlog",
  unstarted: "Unstarted",
  started: "Started",
  completed: "Completed",
  canceled: "Canceled",
};

export function StatusIcon({
  category,
  color,
  size = 16,
  className,
}: StatusIconProps) {
  const fill = color ?? defaultColors[category];
  const label = labels[category];

  switch (category) {
    case "backlog":
      // Dashed circle
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle
            cx="8"
            cy="8"
            r="5.5"
            stroke={fill}
            strokeWidth="1.5"
            strokeDasharray="2.4 2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "unstarted":
      // Empty circle
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle cx="8" cy="8" r="5.5" stroke={fill} strokeWidth="1.5" />
        </svg>
      );

    case "started":
      // Half-filled circle
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle cx="8" cy="8" r="5.5" stroke={fill} strokeWidth="1.5" />
          <path d="M8 2.5A5.5 5.5 0 0 0 8 13.5V2.5Z" fill={fill} />
        </svg>
      );

    case "completed":
      // Filled circle with checkmark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle cx="8" cy="8" r="6" fill={fill} />
          <path
            d="M5.5 8L7.2 9.7L10.5 6.3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "canceled":
      // Circle with X
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle cx="8" cy="8" r="5.5" stroke={fill} strokeWidth="1.5" />
          <path
            d="M6 6L10 10M10 6L6 10"
            stroke={fill}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "triage":
      // Dotted circle (triage)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          role="img"
          aria-label={label}
          className={className}
        >
          <circle
            cx="8"
            cy="8"
            r="5.5"
            stroke={fill}
            strokeWidth="1.5"
            strokeDasharray="1.5 2.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
