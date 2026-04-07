"use client";

import { EmptyState } from "@/components/empty-state";
import { NotificationRow } from "@/components/notification-row";
import { useCallback, useEffect, useState } from "react";

interface Notification {
  id: string;
  type: "assigned" | "mentioned" | "status_change" | "comment" | "duplicate";
  actorName: string;
  actorImage: string | null;
  issueIdentifier: string;
  issueTitle: string;
  issueId: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);

      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.readAt) {
        fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [notifications],
  );

  const selected = notifications.find((n) => n.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-[13px] text-[#6b6f76]">Loading...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="You're all caught up"
        description="When you're assigned to issues, mentioned, or receive updates, notifications will appear here."
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b6f76"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Inbox"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#1c1e21] px-4 py-3">
        <h1 className="text-[14px] font-semibold text-white">Inbox</h1>
        {unreadCount > 0 && (
          <span className="text-[12px] text-[#6b6f76]">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Content: list + detail panel */}
      <div className="flex min-h-0 flex-1">
        {/* Notification list */}
        <div className="w-full min-w-0 overflow-y-auto border-r border-[#1c1e21] md:w-[400px] md:shrink-0">
          <div className="flex flex-col gap-0.5 p-1.5">
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                id={n.id}
                type={n.type}
                actorName={n.actorName}
                actorImage={n.actorImage}
                issueIdentifier={n.issueIdentifier}
                issueTitle={n.issueTitle}
                readAt={n.readAt}
                createdAt={n.createdAt}
                isSelected={n.id === selectedId}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="hidden flex-1 overflow-y-auto p-6 md:block">
          {selected ? (
            <div>
              <div className="mb-2 text-[12px] text-[#6b6f76]">
                {selected.issueIdentifier}
              </div>
              <h2 className="mb-4 text-[16px] font-semibold text-white">
                {selected.issueTitle}
              </h2>
              <p className="text-[13px] text-[#b0b5c0]">
                <span className="font-medium text-white">
                  {selected.actorName}
                </span>{" "}
                {selected.type === "assigned" && "assigned this issue to you"}
                {selected.type === "mentioned" && "mentioned you in this issue"}
                {selected.type === "status_change" &&
                  "changed the status of this issue"}
                {selected.type === "comment" && "commented on this issue"}
                {selected.type === "duplicate" &&
                  "marked this issue as duplicate"}
              </p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-[13px] text-[#6b6f76]">
                Select a notification to view details
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
