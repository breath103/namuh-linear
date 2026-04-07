import { IssueProperties } from "@/components/issue-properties";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
});

describe("IssueProperties", () => {
  const defaultProps = {
    status: {
      name: "Research Needed",
      category: "backlog" as const,
      color: "#6b6f76",
    },
    priority: "medium" as const,
    assignee: { name: "Jaeyun Ha", image: null },
    labels: [{ id: "1", name: "agent", color: "#6b7280" }],
    project: null,
  };

  it("renders status property", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("Research Needed")).toBeDefined();
  });

  it("renders priority property", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("Medium")).toBeDefined();
  });

  it("renders assignee name", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("Jaeyun Ha")).toBeDefined();
  });

  it("renders labels", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("agent")).toBeDefined();
  });

  it("renders status icon", () => {
    render(<IssueProperties {...defaultProps} />);
    const icon = screen.getByRole("img", { name: /backlog/i });
    expect(icon).toBeDefined();
  });

  it("renders priority icon", () => {
    render(<IssueProperties {...defaultProps} />);
    const icon = screen.getByRole("img", { name: /medium/i });
    expect(icon).toBeDefined();
  });

  it("shows 'No assignee' when assignee is null", () => {
    render(<IssueProperties {...defaultProps} assignee={null} />);
    expect(screen.getByText("No assignee")).toBeDefined();
  });

  it("shows 'Add to project' when project is null", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("Add to project")).toBeDefined();
  });

  it("renders project name when provided", () => {
    render(
      <IssueProperties
        {...defaultProps}
        project={{ name: "Chrome Extension", icon: "🌐" }}
      />,
    );
    expect(screen.getByText("Chrome Extension")).toBeDefined();
  });

  it("renders property labels (Status, Priority, Assignee, Labels, Project)", () => {
    render(<IssueProperties {...defaultProps} />);
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Priority")).toBeDefined();
    expect(screen.getByText("Assignee")).toBeDefined();
    expect(screen.getByText("Labels")).toBeDefined();
    expect(screen.getByText("Project")).toBeDefined();
  });
});
