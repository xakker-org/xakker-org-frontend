import { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "xk_ui_theme";
const Ctx = createContext({ theme: "dark", setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, setTheme, toggleTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
