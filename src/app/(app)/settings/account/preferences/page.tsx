"use client";

import { useState } from "react";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[13px] text-[var(--color-text-primary)]">
          {label}
        </div>
        {description && (
          <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[var(--color-border)] bg-transparent px-2.5 py-1 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mt-6 mb-2 border-b border-[var(--color-border)] pb-2 text-[13px] font-medium text-[var(--color-text-primary)]">
      {title}
    </h3>
  );
}

function ThemeCard({
  label,
  active,
  onClick,
  variant,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: "system" | "light" | "dark";
}) {
  const bgColor =
    variant === "dark"
      ? "bg-[#0f0f11]"
      : variant === "light"
        ? "bg-[#fcfcfd]"
        : "bg-gradient-to-r from-[#0f0f11] to-[#fcfcfd]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
        active
          ? "border-[var(--color-accent)]"
          : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]"
      }`}
    >
      <div
        className={`h-[48px] w-[72px] rounded-md ${bgColor} border border-[var(--color-border)]`}
      />
      <span className="text-[11px] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </button>
  );
}

export default function PreferencesPage() {
  const [homeView, setHomeView] = useState("my-issues");
  const [displayNames, setDisplayNames] = useState("full");
  const [firstDay, setFirstDay] = useState("sunday");
  const [emoticons, setEmoticons] = useState(true);
  const [commentShortcut, setCommentShortcut] = useState("cmd-enter");
  const [theme, setTheme] = useState("system");
  const [fontSize, setFontSize] = useState("default");
  const [pointerCursors, setPointerCursors] = useState(false);
  const [desktopApp, setDesktopApp] = useState(false);

  return (
    <div className="max-w-[600px]">
      <h1 className="mb-2 text-[20px] font-semibold text-[var(--color-text-primary)]">
        Preferences
      </h1>

      <SectionHeader title="General" />

      <SettingRow label="Default home view">
        <Select
          value={homeView}
          onChange={setHomeView}
          options={[
            { label: "My Issues", value: "my-issues" },
            { label: "Inbox", value: "inbox" },
            { label: "Active Issues", value: "active-issues" },
          ]}
        />
      </SettingRow>

      <SettingRow label="Display names">
        <Select
          value={displayNames}
          onChange={setDisplayNames}
          options={[
            { label: "Full name", value: "full" },
            { label: "First name", value: "first" },
          ]}
        />
      </SettingRow>

      <SettingRow label="First day of week">
        <Select
          value={firstDay}
          onChange={setFirstDay}
          options={[
            { label: "Sunday", value: "sunday" },
            { label: "Monday", value: "monday" },
          ]}
        />
      </SettingRow>

      <SettingRow label="Convert emoticons">
        <Toggle checked={emoticons} onChange={setEmoticons} />
      </SettingRow>

      <SettingRow label="Send comment shortcut">
        <Select
          value={commentShortcut}
          onChange={setCommentShortcut}
          options={[
            { label: "⌘ + Enter", value: "cmd-enter" },
            { label: "Enter", value: "enter" },
          ]}
        />
      </SettingRow>

      <SectionHeader title="Interface & theme" />

      <div className="py-3">
        <div className="mb-3 text-[13px] text-[var(--color-text-primary)]">
          Interface theme
        </div>
        <div className="flex gap-3">
          <ThemeCard
            label="System preference"
            variant="system"
            active={theme === "system"}
            onClick={() => setTheme("system")}
          />
          <ThemeCard
            label="Light"
            variant="light"
            active={theme === "light"}
            onClick={() => setTheme("light")}
          />
          <ThemeCard
            label="Dark"
            variant="dark"
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
          />
        </div>
      </div>

      <SettingRow label="Font size">
        <Select
          value={fontSize}
          onChange={setFontSize}
          options={[
            { label: "Default", value: "default" },
            { label: "Small", value: "small" },
            { label: "Large", value: "large" },
          ]}
        />
      </SettingRow>

      <SettingRow label="Use pointer cursors">
        <Toggle checked={pointerCursors} onChange={setPointerCursors} />
      </SettingRow>

      <SectionHeader title="Desktop application" />

      <SettingRow label="Open in desktop app">
        <Toggle checked={desktopApp} onChange={setDesktopApp} />
      </SettingRow>
    </div>
  );
}
