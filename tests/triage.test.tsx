import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

function makeTriageIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: "issue-1",
    identifier: "ENG-42",
    title: "Fix login button alignment",
    creatorName: "Alice Smith",
    creatorImage: null,
    createdAt: "2026-04-06T10:30:00.000Z",
    priority: "none",
    labels: [],
    ...overrides,
  };
}

// ─── TriageRow ──────────────────────────────────────────────────────

describe("TriageRow", () => {
  afterEach(cleanup);

  it("renders issue title", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText("Fix login button alignment")).toBeTruthy();
  });

  it("renders issue identifier", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText("ENG-42")).toBeTruthy();
  });

  it("renders creator name", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText("Alice Smith")).toBeTruthy();
  });

  it("renders relative timestamp", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    // Should render some time ago text
    expect(screen.getByText(/Apr 6/)).toBeTruthy();
  });

  it("calls onAccept when accept button clicked", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    const onAccept = vi.fn();
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={onAccept}
        onDecline={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Accept issue"));
    expect(onAccept).toHaveBeenCalledWith("issue-1");
  });

  it("calls onDecline when decline button clicked", async () => {
    const { TriageRow } = await import("@/components/triage-row");
    const onDecline = vi.fn();
    render(
      <TriageRow
        issue={makeTriageIssue()}
        onAccept={vi.fn()}
        onDecline={onDecline}
      />,
    );
    fireEvent.click(screen.getByLabelText("Decline issue"));
    expect(onDecline).toHaveBeenCalledWith("issue-1");
  });
});

// ─── TriageHeader ───────────────────────────────────────────────────

describe("TriageHeader", () => {
  afterEach(cleanup);

  it("renders triage count", async () => {
    const { TriageHeader } = await import("@/components/triage-header");
    render(<TriageHeader teamName="Engineering" count={68} />);
    expect(screen.getByText("68 issues to triage")).toBeTruthy();
  });

  it("renders team name", async () => {
    const { TriageHeader } = await import("@/components/triage-header");
    render(<TriageHeader teamName="Engineering" count={5} />);
    expect(screen.getByText("Triage")).toBeTruthy();
  });

  it("renders zero count", async () => {
    const { TriageHeader } = await import("@/components/triage-header");
    render(<TriageHeader teamName="Engineering" count={0} />);
    expect(screen.getByText("0 issues to triage")).toBeTruthy();
  });
});
