interface PriorityIconProps {
  priority: 0 | 1 | 2 | 3 | 4;
  size?: number;
  className?: string;
}

const priorityConfig = {
  0: { label: "No priority", color: "var(--color-priority-none)" },
  1: { label: "Urgent", color: "var(--color-priority-urgent)" },
  2: { label: "High", color: "var(--color-priority-high)" },
  3: { label: "Medium", color: "var(--color-priority-medium)" },
  4: { label: "Low", color: "var(--color-priority-low)" },
} as const;

export function PriorityIcon({
  priority,
  size = 16,
  className,
}: PriorityIconProps) {
  const config = priorityConfig[priority];

  if (priority === 1) {
    // Urgent: exclamation mark in rounded rectangle
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        role="img"
        aria-label={config.label}
        className={className}
      >
        <rect
          x="1"
          y="1"
          width="14"
          height="14"
          rx="3"
          fill={config.color}
          fillOpacity="0.9"
        />
        <path
          d="M8 4v4.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.75" fill="white" />
      </svg>
    );
  }

  if (priority === 0) {
    // No priority: three horizontal dashes
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        role="img"
        aria-label={config.label}
        className={className}
      >
        <path
          d="M3 5.5h10M3 8h10M3 10.5h10"
          stroke={config.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>
    );
  }

  // High/Medium/Low: bar chart with varying heights
  const barHeights = {
    2: [10, 7, 4], // High: tall bars
    3: [6, 6, 4], // Medium: medium bars
    4: [4, 4, 4], // Low: short bars
  } as const;

  const heights = barHeights[priority as 2 | 3 | 4];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      aria-label={config.label}
      className={className}
    >
      <rect
        x="2"
        y={14 - heights[0]}
        width="3"
        height={heights[0]}
        rx="1"
        fill={config.color}
      />
      <rect
        x="6.5"
        y={14 - heights[1]}
        width="3"
        height={heights[1]}
        rx="1"
        fill={config.color}
        fillOpacity={priority >= 3 ? "0.5" : "1"}
      />
      <rect
        x="11"
        y={14 - heights[2]}
        width="3"
        height={heights[2]}
        rx="1"
        fill={config.color}
        fillOpacity={priority >= 4 ? "0.3" : priority >= 3 ? "0.5" : "1"}
      />
    </svg>
  );
}
