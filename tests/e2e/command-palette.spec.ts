import { expect, test } from "@playwright/test";

test.describe("Command Palette", () => {
  test("opens with Cmd+K and closes with Escape", async ({ page }) => {
    await page.goto("/inbox");

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
    await page.goto("/inbox");

    await page.getByLabel("Search").click();

    const input = page.getByPlaceholder("Type a command or search...");
    await expect(input).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Create new issue/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open last issue/i }),
    ).toBeVisible();
    await expect(page.getByText("More actions")).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("dialog", { name: "Command palette" }),
    ).toBeVisible();
  });

  test("filters commands by search query", async ({ page }) => {
    await page.goto("/inbox");

    await page.getByLabel("Search").click();

    const input = page.getByPlaceholder("Type a command or search...");
    await expect(input).toBeVisible();
    await input.fill("inbox");

    // Should filter to only matching commands
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog.getByText("Go to Inbox")).toBeVisible();

    // Non-matching commands should be hidden
    await expect(dialog.getByText("Create new issue")).not.toBeVisible();
  });

  test("navigates to page when command selected", async ({ page }) => {
    await page.goto("/inbox");

    await page.getByLabel("Search").click();
    const input = page.getByPlaceholder("Type a command or search...");
    await expect(input).toBeVisible();
    await input.fill("inbox");
    await page.keyboard.press("Enter");

    // Should navigate to inbox
    await page.waitForURL("**/inbox");
  });
});
