import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFilters } from "@/hooks/use-filters";

describe("useFilters", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

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
  });

  it("persists filters for a scope and restores them for the next mount", () => {
    const { result, unmount } = renderHook(() => useFilters("team:ONB"));

    act(() => {
      result.current.updateFilters([
        { type: "status", operator: "is", values: ["backlog"] },
      ]);
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "namuh-linear-filters:team:ONB",
      JSON.stringify([{ type: "status", operator: "is", values: ["backlog"] }]),
    );

    unmount();

    const restored = renderHook(() => useFilters("team:ONB"));
    expect(restored.result.current.filters).toEqual([
      { type: "status", operator: "is", values: ["backlog"] },
    ]);
  });

  it("isolates filters by scope", () => {
    const teamFilters = renderHook(() => useFilters("team:ONB"));

    act(() => {
      teamFilters.result.current.updateFilters([
        { type: "priority", operator: "is", values: ["high"] },
      ]);
    });

    const boardFilters = renderHook(() => useFilters("team:PLT"));
    expect(boardFilters.result.current.filters).toEqual([]);
  });
});
