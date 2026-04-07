import { Avatar } from "@/components/avatar";
import { PriorityIcon } from "@/components/icons/priority-icon";
import { StatusIcon } from "@/components/icons/status-icon";
import { LabelChip } from "@/components/label-chip";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
});

describe("PriorityIcon", () => {
  it("renders urgent priority with correct label", () => {
    render(<PriorityIcon priority={1} />);
    const icon = screen.getByRole("img", { name: /urgent/i });
    expect(icon).toBeDefined();
  });

  it("renders high priority with correct label", () => {
    render(<PriorityIcon priority={2} />);
    const icon = screen.getByRole("img", { name: /high/i });
    expect(icon).toBeDefined();
  });

  it("renders medium priority with correct label", () => {
    render(<PriorityIcon priority={3} />);
    const icon = screen.getByRole("img", { name: /medium/i });
    expect(icon).toBeDefined();
  });

  it("renders low priority with correct label", () => {
    render(<PriorityIcon priority={4} />);
    const icon = screen.getByRole("img", { name: /low/i });
    expect(icon).toBeDefined();
  });

  it("renders no priority with correct label", () => {
    render(<PriorityIcon priority={0} />);
    const icon = screen.getByRole("img", { name: /no priority/i });
    expect(icon).toBeDefined();
  });

  it("applies custom size", () => {
    const { container } = render(<PriorityIcon priority={1} size={20} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("height")).toBe("20");
  });

  it("applies custom className", () => {
    const { container } = render(
      <PriorityIcon priority={1} className="custom-class" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("custom-class")).toBe(true);
  });
});

describe("StatusIcon", () => {
  it("renders backlog status", () => {
    render(<StatusIcon category="backlog" />);
    const icon = screen.getByRole("img", { name: /backlog/i });
    expect(icon).toBeDefined();
  });

  it("renders unstarted status", () => {
    render(<StatusIcon category="unstarted" />);
    const icon = screen.getByRole("img", { name: /unstarted/i });
    expect(icon).toBeDefined();
  });

  it("renders started status", () => {
    render(<StatusIcon category="started" />);
    const icon = screen.getByRole("img", { name: /started/i });
    expect(icon).toBeDefined();
  });

  it("renders completed status", () => {
    render(<StatusIcon category="completed" />);
    const icon = screen.getByRole("img", { name: /completed/i });
    expect(icon).toBeDefined();
  });

  it("renders canceled status", () => {
    render(<StatusIcon category="canceled" />);
    const icon = screen.getByRole("img", { name: /canceled/i });
    expect(icon).toBeDefined();
  });

  it("renders triage status", () => {
    render(<StatusIcon category="triage" />);
    const icon = screen.getByRole("img", { name: /triage/i });
    expect(icon).toBeDefined();
  });

  it("applies custom color", () => {
    const { container } = render(
      <StatusIcon category="started" color="#ff0000" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("applies custom size", () => {
    const { container } = render(<StatusIcon category="backlog" size={20} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("height")).toBe("20");
  });
});

describe("Avatar", () => {
  it("renders initials when no image is provided", () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText("JD")).toBeDefined();
  });

  it("renders single initial for single name", () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText("A")).toBeDefined();
  });

  it("renders image when src is provided", () => {
    render(<Avatar name="John Doe" src="/avatar.png" />);
    const img = screen.getByRole("img");
    expect(img).toBeDefined();
  });

  it("applies default size of 20px", () => {
    const { container } = render(<Avatar name="Test" />);
    const avatar = container.firstElementChild;
    expect(avatar?.classList.contains("h-5")).toBe(true);
    expect(avatar?.classList.contains("w-5")).toBe(true);
  });

  it("applies small size", () => {
    const { container } = render(<Avatar name="Test" size="sm" />);
    const avatar = container.firstElementChild;
    expect(avatar?.classList.contains("h-4")).toBe(true);
    expect(avatar?.classList.contains("w-4")).toBe(true);
  });

  it("applies large size", () => {
    const { container } = render(<Avatar name="Test" size="lg" />);
    const avatar = container.firstElementChild;
    expect(avatar?.classList.contains("h-8")).toBe(true);
    expect(avatar?.classList.contains("w-8")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Avatar name="Test" className="custom-class" />,
    );
    const avatar = container.firstElementChild;
    expect(avatar?.classList.contains("custom-class")).toBe(true);
  });
});

describe("LabelChip", () => {
  it("renders label text", () => {
    render(<LabelChip name="bug" color="#ef4444" />);
    expect(screen.getByText("bug")).toBeDefined();
  });

  it("renders colored dot", () => {
    const { container } = render(<LabelChip name="feature" color="#22c55e" />);
    const dot = container.querySelector("[data-testid='label-dot']");
    expect(dot).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(
      <LabelChip name="bug" color="#ef4444" className="custom-class" />,
    );
    const chip = container.firstElementChild;
    expect(chip?.classList.contains("custom-class")).toBe(true);
  });

  it("renders multiple labels side by side", () => {
    render(
      <div>
        <LabelChip name="bug" color="#ef4444" />
        <LabelChip name="frontend" color="#3b82f6" />
      </div>,
    );
    expect(screen.getByText("bug")).toBeDefined();
    expect(screen.getByText("frontend")).toBeDefined();
  });
});
