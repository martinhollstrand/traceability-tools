"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (value: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use light mode for now
  // TODO: Add dark mode support later by:
  // 1. Reading from localStorage: window.localStorage.getItem("theme")
  // 2. Detecting system preference: window.matchMedia("(prefers-color-scheme: dark)")
  // 3. Updating setTheme to persist to localStorage
  const theme: Theme = "light";

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, []);

  // Placeholder function - will be implemented when dark mode is added
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTheme = React.useCallback((_value: Theme) => {
    // TODO: Implement theme switching when dark mode is added
    // setThemeState(_value);
    // window.localStorage.setItem("theme", _value);
    // document.documentElement.dataset.theme = _value;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
