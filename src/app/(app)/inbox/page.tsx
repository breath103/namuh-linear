"use client";

import { EmptyState } from "@/components/empty-state";

export default function InboxPage() {
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
