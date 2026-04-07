"use client";

import type { FilterCondition } from "@/components/filter-bar";
import { useCallback, useEffect, useMemo, useState } from "react";

const FILTER_STORAGE_PREFIX = "namuh-linear-filters:";

function getStorage(): Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) {
    return null;
  }

  return storage;
}

function readStoredFilters(storageKey: string): FilterCondition[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FilterCondition[]) : [];
  } catch {
    return [];
  }
}

export function useFilters(scope: string) {
  const storageKey = useMemo(() => `${FILTER_STORAGE_PREFIX}${scope}`, [scope]);
  const [filters, setFilters] = useState<FilterCondition[]>(() =>
    readStoredFilters(storageKey),
  );

  useEffect(() => {
    setFilters(readStoredFilters(storageKey));
  }, [storageKey]);

  useEffect(() => {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    if (filters.length === 0) {
      storage.removeItem(storageKey);
      return;
    }

    storage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey]);

  const updateFilters = useCallback((newFilters: FilterCondition[]) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  return { filters, updateFilters, clearFilters };
}
