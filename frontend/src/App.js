import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ConversationAnalysis from './components/ConversationAnalysis';
import ImageAnalysis from './components/ImageAnalysis';
import DocumentSummarization from './components/DocumentSummarization';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username });
    }
  }, []);

  const handleLogin = (token, username) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUser({ username });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Register onRegister={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/conversation" 
              element={
                isAuthenticated ? 
                <ConversationAnalysis /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/image" 
              element={
                isAuthenticated ? 
                <ImageAnalysis /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/summarize" 
              element={
                isAuthenticated ? 
                <DocumentSummarization /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
