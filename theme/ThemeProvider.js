// ThemeProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
        setDarkMode(savedTheme === 'dark');
      } else {
        const systemTheme = Appearance.getColorScheme();
        setTheme(systemTheme === 'dark' ? darkTheme : lightTheme);
        setDarkMode(systemTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = darkMode ? lightTheme : darkTheme;
    setTheme(newTheme);
    setDarkMode(!darkMode);
    await AsyncStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
