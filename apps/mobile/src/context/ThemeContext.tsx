import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

const defaultTheme: ThemeConfig = {
  primary: '#FF9933',
  background: '#FFF5E6',
  accent: '#FFCC99',
  text: '#1A1A1A',
};

const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export const ThemeProvider: React.FC<{
  theme?: ThemeConfig;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(theme || defaultTheme);

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
