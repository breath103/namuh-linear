import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({}),
}));

import { ProjectRow } from "@/components/project-row";
import { ProjectStatusBadge } from "@/components/project-status-badge";

afterEach(cleanup);

describe("ProjectRow", () => {
  const defaultProps = {
    name: "Agent Speed Optimization",
    icon: "⚡",
    slug: "agent-speed-optimization",
    status: "started" as const,
    priority: "high" as const,
    health: "No updates" as const,
    lead: { name: "Alice", image: undefined as string | undefined },
    targetDate: null as string | null,
    progress: 75,
  };

  it("renders project name with icon", () => {
    render(<ProjectRow {...defaultProps} />);
    expect(screen.getByText("Agent Speed Optimization")).toBeDefined();
    expect(screen.getByText("⚡")).toBeDefined();
  });

  it("renders health status", () => {
    render(<ProjectRow {...defaultProps} />);
    expect(screen.getByText("No updates")).toBeDefined();
  });

  it("renders lead avatar", () => {
    render(<ProjectRow {...defaultProps} />);
    expect(screen.getByTestId("project-lead")).toBeDefined();
  });

  it("renders progress percentage", () => {
    render(<ProjectRow {...defaultProps} />);
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("renders target date when provided", () => {
    render(<ProjectRow {...defaultProps} targetDate="2026-02-05T00:00:00Z" />);
    expect(screen.getByText("Feb 5")).toBeDefined();
  });

  it("renders empty state when no target date", () => {
    render(<ProjectRow {...defaultProps} targetDate={null} />);
    // Should not crash, just no date shown
    expect(
      screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/),
    ).toBeNull();
  });

  it("renders priority icon", () => {
    render(<ProjectRow {...defaultProps} />);
    expect(screen.getByLabelText("High")).toBeDefined();
  });

  it("renders as a clickable link", () => {
    render(<ProjectRow {...defaultProps} />);
    const row = screen.getByTestId("project-row");
    expect(row).toBeDefined();
  });

  it("renders 0% progress", () => {
    render(<ProjectRow {...defaultProps} progress={0} />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("renders 100% progress with completed style", () => {
    render(<ProjectRow {...defaultProps} progress={100} status="completed" />);
    expect(screen.getByText("100%")).toBeDefined();
  });
});

describe("ProjectStatusBadge", () => {
  it("renders planned status", () => {
    render(<ProjectStatusBadge status="planned" />);
    expect(screen.getByText("Planned")).toBeDefined();
  });

  it("renders started status", () => {
    render(<ProjectStatusBadge status="started" />);
    expect(screen.getByText("In Progress")).toBeDefined();
  });

  it("renders completed status", () => {
    render(<ProjectStatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("renders paused status", () => {
    render(<ProjectStatusBadge status="paused" />);
    expect(screen.getByText("Paused")).toBeDefined();
  });

  it("renders canceled status", () => {
    render(<ProjectStatusBadge status="canceled" />);
    expect(screen.getByText("Canceled")).toBeDefined();
  });
});
