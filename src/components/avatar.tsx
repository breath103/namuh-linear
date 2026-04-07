interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 text-[7px]",
  md: "h-5 w-5 text-[8px]",
  lg: "h-8 w-8 text-[11px]",
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  const classes = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${classes} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${classes} flex shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] font-medium text-white ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
