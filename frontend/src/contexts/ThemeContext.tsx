import React, { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}


const defaultThemeContextValue: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {}
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light'); 

  const toggleTheme = () => {
      setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
  }

  return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {children}
      </ThemeContext.Provider>
  );
}
