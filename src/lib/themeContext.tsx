import { createContext, useContext, useState } from "react";

interface ThemeCtx {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: true, setIsDark: () => {},
  menuOpen: false, setMenuOpen: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, menuOpen, setMenuOpen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
