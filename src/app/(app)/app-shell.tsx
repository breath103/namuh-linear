"use client";

import { CommandPalette } from "@/components/command-palette";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
  workspaceName: string;
  workspaceInitials: string;
  teamName: string;
  teamKey: string;
}

interface ShellContext {
  workspaceName: string;
  workspaceInitials: string;
  teamName: string;
  teamKey: string;
}

function getActiveTeamKey(pathname: string): string | null {
  const teamMatch = pathname.match(/^\/team\/([^/]+)/);
  if (teamMatch) {
    return decodeURIComponent(teamMatch[1]);
  }

  const settingsMatch = pathname.match(/^\/settings\/teams\/([^/]+)/);
  if (settingsMatch) {
    return decodeURIComponent(settingsMatch[1]);
  }

  return null;
}

export function AppShell({
  children,
  workspaceName,
  workspaceInitials,
  teamName,
  teamKey,
}: AppShellProps) {
  const pathname = usePathname();
  const [shellContext, setShellContext] = useState<ShellContext>({
    workspaceName,
    workspaceInitials,
    teamName,
    teamKey,
  });

  useEffect(() => {
    const fallbackContext = {
      workspaceName,
      workspaceInitials,
      teamName,
      teamKey,
    };
    const activeTeamKey = getActiveTeamKey(pathname);

    if (!activeTeamKey || activeTeamKey === fallbackContext.teamKey) {
      setShellContext(fallbackContext);
      return;
    }

    let cancelled = false;

    fetch(`/api/teams/${encodeURIComponent(activeTeamKey)}/context`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load team context");
        }

        return (await response.json()) as ShellContext;
      })
      .then((context) => {
        if (!cancelled) {
          setShellContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShellContext(fallbackContext);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, teamKey, teamName, workspaceInitials, workspaceName]);

  return (
    <div className="flex h-screen bg-[#090909]">
      <Sidebar
        workspaceName={shellContext.workspaceName}
        workspaceInitials={shellContext.workspaceInitials}
        teamName={shellContext.teamName}
        teamKey={shellContext.teamKey}
      />
      <main className="flex-1 overflow-hidden p-2 pl-0">
        <div className="h-full overflow-y-auto rounded-xl bg-[#0f0f11] border border-[#1c1e21]">
          {children}
        </div>
      </main>
      <CommandPalette teamKey={shellContext.teamKey} />
    </div>
  );
}
