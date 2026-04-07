import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import PreferencesPage from "@/app/(app)/settings/account/preferences/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/settings/account/preferences",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Account Preferences Page", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(window, "localStorage", {
      writable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key);
        }),
        clear: vi.fn(() => {
          storage.clear();
        }),
      },
    });
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Preferences heading", () => {
    render(<PreferencesPage />);
    expect(
      screen.getByRole("heading", { name: "Preferences" }),
    ).toBeInTheDocument();
  });

  it("renders General section with home view setting", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Default home view")).toBeInTheDocument();
  });

  it("renders Display names combobox", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Display names")).toBeInTheDocument();
  });

  it("renders First day of week setting", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("First day of week")).toBeInTheDocument();
  });

  it("renders Convert emoticons toggle", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Convert emoticons")).toBeInTheDocument();
  });

  it("renders Send comment shortcut setting", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Send comment shortcut")).toBeInTheDocument();
  });

  it("renders Interface & theme section", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Interface & theme")).toBeInTheDocument();
  });

  it("renders theme selector with System/Light/Dark options", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Interface theme")).toBeInTheDocument();
    expect(screen.getByText("System preference")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("renders Font size setting", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Font size")).toBeInTheDocument();
  });

  it("renders Pointer cursors toggle", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Use pointer cursors")).toBeInTheDocument();
  });

  it("renders Desktop application section", () => {
    render(<PreferencesPage />);
    expect(screen.getByText("Desktop application")).toBeInTheDocument();
    expect(screen.getByText("Open in desktop app")).toBeInTheDocument();
  });

  it("applies and persists the selected theme", () => {
    render(<PreferencesPage />);

    fireEvent.click(screen.getByText("Light"));

    expect(window.localStorage.getItem("namuh-linear-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
