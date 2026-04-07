"use client";

import { Avatar } from "@/components/avatar";
import { useEffect, useState } from "react";

interface MemberData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  status: "active" | "pending";
  teams: string[];
  joinedAt: string;
  lastSeenAt: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[var(--color-text-primary)]">
          Members
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            Invite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-4 border-b border-[var(--color-border)] pb-2">
        <button
          type="button"
          className="text-[13px] font-medium text-[var(--color-text-primary)]"
          data-active="true"
        >
          All
        </button>
        <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-tertiary)]">
          <span>
            Active{" "}
            <span className="font-medium text-[var(--color-text-secondary)]">
              {activeCount}
            </span>
          </span>
          <span>
            Application{" "}
            <span className="font-medium text-[var(--color-text-secondary)]">
              {pendingCount}
            </span>
          </span>
        </div>
      </div>

      {/* Table header */}
      <div className="flex h-[32px] items-center border-b border-[var(--color-border)] text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
        <div className="min-w-0 flex-1 px-4">Name</div>
        <div className="w-[180px] shrink-0">Email</div>
        <div className="w-[80px] shrink-0">Status</div>
        <div className="w-[120px] shrink-0">Teams</div>
        <div className="w-[100px] shrink-0">Joined</div>
        <div className="w-[100px] shrink-0">Last seen</div>
      </div>

      {/* Member rows */}
      {members.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
          No members yet. Invite your team to get started.
        </div>
      ) : (
        <div>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex h-[44px] items-center border-b border-[var(--color-border)] text-[13px] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
                <Avatar name={m.name} src={m.image ?? undefined} size="sm" />
                <span className="truncate text-[var(--color-text-primary)]">
                  {m.name}
                </span>
                {m.role === "owner" && (
                  <span className="rounded bg-[var(--color-surface-active)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                    Owner
                  </span>
                )}
              </div>
              <div className="w-[180px] shrink-0 truncate text-[var(--color-text-secondary)]">
                {m.email}
              </div>
              <div className="w-[80px] shrink-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    m.status === "active"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {m.status === "active" ? "Active" : "Pending"}
                </span>
              </div>
              <div className="w-[120px] shrink-0 truncate text-[12px] text-[var(--color-text-tertiary)]">
                {m.teams.join(", ") || "—"}
              </div>
              <div className="w-[100px] shrink-0 text-[12px] text-[var(--color-text-tertiary)]">
                {formatDate(m.joinedAt)}
              </div>
              <div className="w-[100px] shrink-0 text-[12px] text-[var(--color-text-tertiary)]">
                {formatDate(m.lastSeenAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
