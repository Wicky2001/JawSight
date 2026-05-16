import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "jawsight_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // load persisted
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      applyClass(stored);
      return;
    }

    // fallback to system preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    setThemeState(initial);
    applyClass(initial);
  }, []);

  const applyClass = (t: Theme) => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (t === "dark") {
      el.classList.add("dark-theme");
    } else {
      el.classList.remove("dark-theme");
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyClass(t);
    // update meta theme-color for supported mobile browsers
    try {
      const meta = document.querySelector(
        'meta[name="theme-color"]',
      ) as HTMLMetaElement | null;
      if (meta) meta.content = t === "dark" ? "#0B0B0B" : "#F5F7FA";
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeProvider;
