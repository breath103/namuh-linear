import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Must import after mocks
import { CommandPalette } from "@/components/command-palette";

describe("CommandPalette", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when closed", () => {
    render(<CommandPalette teamKey="ENG" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on Cmd+K keyboard shortcut", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Type a command or search..."),
    ).toBeDefined();
  });

  it("opens on Ctrl+K keyboard shortcut", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("closes on Escape key", () => {
    render(<CommandPalette teamKey="ENG" />);

    // Open
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeDefined();

    // Close
    const input = screen.getByPlaceholderText("Type a command or search...");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on backdrop click", () => {
    render(<CommandPalette teamKey="ENG" />);

    // Open
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeDefined();

    // Click backdrop
    const backdrop = document.querySelector('[role="presentation"]');
    expect(backdrop).not.toBeNull();
    if (backdrop) fireEvent.click(backdrop);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows command groups when opened", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(screen.getByText("Issues")).toBeDefined();
    expect(screen.getByText("Navigation")).toBeDefined();
    expect(screen.getByText("Create new issue")).toBeDefined();
    expect(screen.getByText("Go to Inbox")).toBeDefined();
  });

  it("filters commands by query", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = screen.getByPlaceholderText("Type a command or search...");
    fireEvent.change(input, { target: { value: "inbox" } });

    expect(screen.getByText("Go to Inbox")).toBeDefined();
    expect(screen.queryByText("Create new issue")).toBeNull();
  });

  it("navigates with Enter key on a navigation command", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = screen.getByPlaceholderText("Type a command or search...");
    fireEvent.change(input, { target: { value: "inbox" } });

    // Press Enter to select the first result
    fireEvent.keyDown(input, { key: "Enter" });

    expect(pushMock).toHaveBeenCalledWith("/inbox");
  });

  it("shows keyboard shortcuts for commands", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    // "C" shortcut for Create new issue
    expect(screen.getByText("C")).toBeDefined();
  });

  it("uses teamKey for team-scoped navigation", () => {
    render(<CommandPalette teamKey="MYTEAM" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = screen.getByPlaceholderText("Type a command or search...");
    fireEvent.change(input, { target: { value: "board" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(pushMock).toHaveBeenCalledWith("/team/MYTEAM/board");
  });

  it("shows empty state when no results match", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = screen.getByPlaceholderText("Type a command or search...");
    fireEvent.change(input, {
      target: { value: "xyznonexistentcommand123" },
    });

    expect(screen.getByText(/No results found for/)).toBeDefined();
  });

  it("toggles open/closed with repeated Cmd+K", () => {
    render(<CommandPalette teamKey="ENG" />);

    // Open
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeDefined();

    // Close
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports arrow key navigation", () => {
    render(<CommandPalette teamKey="ENG" />);

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = screen.getByPlaceholderText("Type a command or search...");

    // Arrow down should not throw
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    // Component should still be open and functional
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
