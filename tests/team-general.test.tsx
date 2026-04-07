import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/settings/teams/ENG/general",
  useParams: () => ({ key: "ENG" }),
}));

const mockTeam = {
  name: "Engineering",
  key: "ENG",
  icon: "🟣",
  timezone: "America/Los_Angeles",
  estimateType: "none",
  emailEnabled: false,
  detailedHistory: false,
};

describe("TeamGeneralSettingsPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  async function renderPage() {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ team: mockTeam }),
      }),
    );

    const { default: TeamGeneralPage } = await import(
      "@/app/(app)/settings/teams/[key]/general/page"
    );
    render(<TeamGeneralPage />);
    await screen.findByText("General");
  }

  it("renders page title 'General'", async () => {
    await renderPage();
    expect(screen.getByText("General")).toBeDefined();
  });

  it("renders 'Icon & Name' section", async () => {
    await renderPage();
    expect(screen.getByText("Icon & Name")).toBeDefined();
  });

  it("renders team name input with current value", async () => {
    await renderPage();
    const input = screen.getByDisplayValue("Engineering");
    expect(input).toBeDefined();
  });

  it("renders 'Identifier' section with description", async () => {
    await renderPage();
    expect(screen.getByText("Identifier")).toBeDefined();
    expect(screen.getByText(/used in issue IDs/i)).toBeDefined();
  });

  it("renders identifier input with current key", async () => {
    await renderPage();
    const input = screen.getByDisplayValue("ENG");
    expect(input).toBeDefined();
  });

  it("renders 'Timezone' section with description", async () => {
    await renderPage();
    const timezones = screen.getAllByText("Timezone");
    expect(timezones.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/timezone should be set/i)).toBeDefined();
  });

  it("renders timezone selector", async () => {
    await renderPage();
    const matches = screen.getAllByText(/Pacific Time - Los Angeles/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'Estimates' section with description", async () => {
    await renderPage();
    expect(screen.getByText("Estimates")).toBeDefined();
    expect(screen.getByText(/communicating the complexity/i)).toBeDefined();
  });

  it("renders 'Issue estimation' selector", async () => {
    await renderPage();
    expect(screen.getByText("Issue estimation")).toBeDefined();
  });

  it("renders 'Create issues by email' toggle", async () => {
    await renderPage();
    const matches = screen.getAllByText("Create issues by email");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'Enable detailed issue history' toggle", async () => {
    await renderPage();
    expect(screen.getByText("Enable detailed issue history")).toBeDefined();
  });
});
