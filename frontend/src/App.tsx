import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import AppStructure from './components/AppStructure';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const {theme} = useTheme();

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);
  
  return (
    <AppStructure/>
  );
}

export default App;