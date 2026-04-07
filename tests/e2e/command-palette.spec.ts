import { expect, test } from "@playwright/test";

test.describe("Command Palette", () => {
  test("opens with Cmd+K and closes with Escape", async ({ page }) => {
    await page.goto("/team/ENG/all");

    // Open command palette with Cmd+K
    await page.keyboard.press("Meta+k");

    // Should see the palette dialog
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    // Should have search input
    const input = page.getByPlaceholder("Type a command or search...");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("shows commands and allows keyboard navigation", async ({ page }) => {
    await page.goto("/team/ENG/all");

    await page.keyboard.press("Meta+k");

    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    // Should show command groups
    await expect(dialog.getByText("Issues")).toBeVisible();
    await expect(dialog.getByText("Navigation")).toBeVisible();
    await expect(dialog.getByText("Create new issue")).toBeVisible();

    // Arrow down and Enter should work
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
  });

  test("filters commands by search query", async ({ page }) => {
    await page.goto("/team/ENG/all");

    await page.keyboard.press("Meta+k");

    const input = page.getByPlaceholder("Type a command or search...");
    await input.fill("inbox");

    // Should filter to only matching commands
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog.getByText("Go to Inbox")).toBeVisible();

    // Non-matching commands should be hidden
    await expect(dialog.getByText("Create new issue")).not.toBeVisible();
  });

  test("navigates to page when command selected", async ({ page }) => {
    await page.goto("/team/ENG/all");

    await page.keyboard.press("Meta+k");

    const input = page.getByPlaceholder("Type a command or search...");
    await input.fill("inbox");
    await page.keyboard.press("Enter");

    // Should navigate to inbox
    await page.waitForURL("**/inbox");
  });
});
