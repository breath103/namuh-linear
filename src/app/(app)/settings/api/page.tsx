"use client";

import { useState } from "react";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-8 text-[16px] font-semibold text-[var(--color-text-primary)]">
      {children}
    </h2>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] px-4 py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
      {text}
    </div>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)]"
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}

function DocsLink() {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      Docs{" "}
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </span>
  );
}

export default function ApiSettingsPage() {
  const [permissionLevel, setPermissionLevel] = useState("admins");

  return (
    <div className="max-w-[720px]">
      <h1 className="mb-4 text-[20px] font-semibold text-[var(--color-text-primary)]">
        API
      </h1>

      <p className="mb-2 text-[13px] text-[var(--color-text-secondary)]">
        Linear&apos;s GraphQL API provides a programmable interface to your
        data. Use our API to build public or private apps, workflows, and
        integrations for Linear.{" "}
        <span className="text-[var(--color-accent)]">Join our Slack</span> for
        help and questions.
      </p>
      <div className="mb-6">
        <DocsLink />
      </div>

      {/* ─── OAuth Applications ───────────────────────────── */}
      <SectionHeader>OAuth Applications</SectionHeader>
      <p className="mb-4 text-[13px] text-[var(--color-text-tertiary)]">
        Manage your organization&apos;s OAuth applications. <DocsLink />
      </p>

      <div className="mb-2 flex justify-end">
        <AddButton label="New OAuth application" />
      </div>
      <EmptyList text="No OAuth applications" />

      {/* ─── Webhooks ─────────────────────────────────────── */}
      <SectionHeader>Webhooks</SectionHeader>
      <p className="mb-1 text-[13px] text-[var(--color-text-tertiary)]">
        Webhooks allow you to receive HTTP requests when an entity is created,
        updated, or deleted.
      </p>
      <div className="mb-4">
        <DocsLink />
      </div>

      <div className="mb-2 flex justify-end">
        <AddButton label="New webhook" />
      </div>
      <EmptyList text="No webhooks" />

      {/* ─── Member API keys ──────────────────────────────── */}
      <SectionHeader>Member API keys</SectionHeader>
      <p className="mb-4 text-[13px] text-[var(--color-text-tertiary)]">
        Members of your workspace can create API keys to interact with the
        Linear API on their behalf. View your personal API keys from your{" "}
        <span className="font-medium text-[var(--color-accent)]">
          security & access settings
        </span>
        .
      </p>

      <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
        <div>
          <div className="text-[13px] text-[var(--color-text-primary)]">
            API key creation
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
            Who can create API keys to interact with the Linear API on their
            behalf
          </div>
        </div>
        <select
          value={permissionLevel}
          onChange={(e) => setPermissionLevel(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] outline-none"
        >
          <option value="admins">Only admins</option>
          <option value="members">All members</option>
        </select>
      </div>

      <EmptyList text="No API keys" />
    </div>
  );
}
