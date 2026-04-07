"use client";

import {
  APP_THEME_CHANGE_EVENT,
  applyTheme,
  getStoredTheme,
} from "@/lib/theme";
import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    const syncTheme = () => {
      applyTheme(getStoredTheme());
    };

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const handleMediaChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };

    syncTheme();
    window.addEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
    window.addEventListener("storage", syncTheme);
    mediaQuery?.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener(APP_THEME_CHANGE_EVENT, syncTheme);
      window.removeEventListener("storage", syncTheme);
      mediaQuery?.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return null;
}
