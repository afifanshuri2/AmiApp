"use client";
import { useCallback, useEffect, useState } from "react";

export const accents = ["rose", "sage", "lavender"] as const;
export const modes = ["auto", "light", "dark"] as const;
export type Accent = (typeof accents)[number];
export type Mode = (typeof modes)[number];

function read<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private mode: the choice simply is not remembered. */
  }
}
/** Applies accent and light/dark mode to <html>, so dialogs and toasts inherit them. */
export function useTheme() {
  const [accent, setAccentState] = useState<Accent>("rose"),
    [mode, setModeState] = useState<Mode>("auto");
  useEffect(() => {
    setAccentState(read("ami-theme", accents, "rose"));
    setModeState(read("ami-mode", modes, "auto"));
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      root.dataset.theme = accent;
      root.dataset.mode =
        mode === "auto" ? (query.matches ? "dark" : "light") : mode;
    };
    apply();
    if (mode !== "auto") return;
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [accent, mode]);
  const setAccent = useCallback((value: Accent) => {
    setAccentState(value);
    write("ami-theme", value);
  }, []);
  const setMode = useCallback((value: Mode) => {
    setModeState(value);
    write("ami-mode", value);
  }, []);
  return { accent, setAccent, mode, setMode };
}
