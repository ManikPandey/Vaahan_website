import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New state to track if the user wants to login/signup
  const [showAuth, setShowAuth] = useState(false);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('vahan_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vahan_token');
    localStorage.removeItem('vahan_user');
    setUser(null);
    setShowAuth(false); // Send them back to the landing page on logout
  };

  if (loading) return null;

  // 1. If user is completely logged in, show the main dashboard
  if (user) {
    // Pass setUser down as a prop so child pages can update the global app state
    return <MainLayout user={user} onLogout={handleLogout} onUpdateUser={setUser} />;
  }

  // 2. If user clicked "Get Started" on the landing page, show the Login/Signup screen
  if (showAuth) {
    return <AuthPage onAuthSuccess={(userData) => setUser(userData)} onBack={() => setShowAuth(false)} />;
  }

  // 3. Default state for a new visitor: Show the gorgeous Marketing Landing Page
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}