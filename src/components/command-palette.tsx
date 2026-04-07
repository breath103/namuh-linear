"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface CommandPaletteProps {
  teamKey: string;
}

interface SearchResult {
  id: string;
  identifier: string;
  title: string;
  priority: string;
}

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

export function CommandPalette({ teamKey }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Commands
  const commands: CommandItem[] = [
    {
      id: "create-issue",
      label: "Create new issue",
      shortcut: "C",
      group: "Issues",
      action: () => {
        close();
        // Dispatch custom event to open create issue modal
        window.dispatchEvent(new CustomEvent("open-create-issue"));
      },
    },
    {
      id: "create-issue-fullscreen",
      label: "Create in fullscreen",
      shortcut: "V",
      group: "Issues",
      action: () => {
        close();
      },
    },
    {
      id: "create-project",
      label: "Create project",
      shortcut: "N P",
      group: "Projects",
      action: () => {
        close();
        router.push("/projects");
      },
    },
    {
      id: "create-view",
      label: "Create view",
      group: "Views",
      action: () => {
        close();
        router.push("/views");
      },
    },
    {
      id: "nav-inbox",
      label: "Go to Inbox",
      group: "Navigation",
      action: () => {
        close();
        router.push("/inbox");
      },
    },
    {
      id: "nav-my-issues",
      label: "Go to My Issues",
      group: "Navigation",
      action: () => {
        close();
        router.push("/my-issues/assigned");
      },
    },
    {
      id: "nav-projects",
      label: "Go to Projects",
      group: "Navigation",
      action: () => {
        close();
        router.push("/projects");
      },
    },
    {
      id: "nav-issues",
      label: "Go to Issues",
      group: "Navigation",
      action: () => {
        close();
        router.push(`/team/${teamKey}/all`);
      },
    },
    {
      id: "nav-board",
      label: "Go to Board",
      group: "Navigation",
      action: () => {
        close();
        router.push(`/team/${teamKey}/board`);
      },
    },
    {
      id: "nav-cycles",
      label: "Go to Cycles",
      group: "Navigation",
      action: () => {
        close();
        router.push(`/team/${teamKey}/cycles`);
      },
    },
    {
      id: "nav-initiatives",
      label: "Go to Initiatives",
      group: "Navigation",
      action: () => {
        close();
        router.push("/initiatives");
      },
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      group: "Navigation",
      action: () => {
        close();
        router.push("/settings");
      },
    },
  ];

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  }, []);

  // Filter commands by query
  const filteredCommands = query
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  // Group commands
  const groupedCommands = filteredCommands.reduce<
    Record<string, CommandItem[]>
  >((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  // Total selectable items: search results + filtered commands
  const totalItems = results.length + filteredCommands.length;

  // Search issues when query changes
  useEffect(() => {
    if (!open) return;

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/issues/search?q=${encodeURIComponent(query)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  // Global Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Reset selected index when items change
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on query/results change intentionally
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  // Keyboard navigation within palette
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1),
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex < results.length) {
          // Navigate to issue
          const result = results[selectedIndex];
          close();
          router.push(`/issue/${result.id}`);
        } else {
          const cmdIndex = selectedIndex - results.length;
          if (cmdIndex < filteredCommands.length) {
            filteredCommands[cmdIndex].action();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalItems, selectedIndex, results, filteredCommands, router, close],
  );

  if (!open) return null;

  let itemIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={close}
        onKeyDown={(e) => e.key === "Escape" && close()}
        role="presentation"
      />

      {/* Palette */}
      <dialog
        open
        className="relative z-10 flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-content-bg)] shadow-2xl"
        aria-label="Command palette"
        onKeyDown={handlePaletteKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-[var(--color-text-secondary)]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none"
          />
          {searching && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-text-secondary)] border-t-transparent" />
          )}
          <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {/* Search results */}
          {results.length > 0 && (
            <div className="px-2">
              <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                Quick results for &ldquo;{query}&rdquo;
              </div>
              {results.map((result) => {
                const idx = itemIndex++;
                return (
                  <button
                    key={result.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      selectedIndex === idx
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                    onClick={() => {
                      close();
                      router.push(`/issue/${result.id}`);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <PriorityDot priority={result.priority} />
                    <span className="shrink-0 text-[12px] text-[var(--color-text-secondary)]">
                      {result.identifier}
                    </span>
                    <span className="truncate text-[13px]">{result.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Commands */}
          {Object.entries(groupedCommands).map(([group, cmds]) => (
            <div key={group} className="px-2">
              <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                {group}
              </div>
              {cmds.map((cmd) => {
                const idx = itemIndex++;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      selectedIndex === idx
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="truncate text-[13px]">{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="ml-auto flex items-center gap-1">
                        {cmd.shortcut.split(" ").map((key) => (
                          <kbd
                            key={key}
                            className={`rounded border px-1.5 py-0.5 text-[11px] ${
                              selectedIndex === idx
                                ? "border-white/30 text-white/80"
                                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                            }`}
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Empty state */}
          {totalItems === 0 && query && (
            <div className="px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2 text-[11px] text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 text-[10px]">
              &crarr;
            </kbd>
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 text-[10px]">
              &uarr;
            </kbd>
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 text-[10px]">
              &darr;
            </kbd>
            Navigate
          </span>
        </div>
      </dialog>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#3b82f6",
    none: "#6b7280",
  };
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: colors[priority] || colors.none }}
    />
  );
}
