import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { socket } from './lib/socket';

import { useThemeStore } from './store/useThemeStore';

const App = () => {
  const { authUser, isCheckingAuth, checkAuth, subscribeToOnlineUsers, unsubscribeFromOnlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    subscribeToOnlineUsers();
    
    return () => {
      unsubscribeFromOnlineUsers();
      if (socket.connected) {
        socket.emit("logout");
        socket.disconnect();
      }
    };
  }, [checkAuth, subscribeToOnlineUsers, unsubscribeFromOnlineUsers]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LogInPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/signup" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/signup" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
