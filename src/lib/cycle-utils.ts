interface CategorizedCycles<T> {
  current: T | null;
  upcoming: T[];
  past: T[];
}

export function categorizeCycles<
  T extends { id: string; startDate: string; endDate: string },
>(cycles: T[], now: Date = new Date()): CategorizedCycles<T> {
  let current: T | null = null;
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const cycle of cycles) {
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);

    if (now >= start && now <= end) {
      current = cycle;
    } else if (start > now) {
      upcoming.push(cycle);
    } else {
      past.push(cycle);
    }
  }

  // Sort upcoming by start date ascending
  upcoming.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // Sort past by end date descending (most recent first)
  past.sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );

  return { current, upcoming, past };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCycleDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
