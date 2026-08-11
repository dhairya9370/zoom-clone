import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../services/api';

const AuthContext = createContext();

// Helper to retrieve or generate a Guest user profile
const getGuestUser = () => {
  let guestId = localStorage.getItem('zoom_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.floor(10000 + Math.random() * 90000);
    localStorage.setItem('zoom_guest_id', guestId);
  }
  return {
    name: 'Guest User',
    username: guestId,
    isGuest: true,
  };
};

export function AuthProvider({ children }) {
  // Token saved in localStorage
  const [token, setToken] = useState(() => localStorage.getItem('zoom_user_token') || null);
  // User state initialized with Guest user by default
  const [user, setUser] = useState(() => getGuestUser());
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState(() => localStorage.getItem('zoom_theme') || 'dark');
  // Toast message state
  const [toastMsg, setToastMsg] = useState('');
  // Auth modal open/close state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Recent meetings list
  const [recentMeetings, setRecentMeetings] = useState([]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('zoom_theme', nextTheme);
    triggerToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  const handleLogout = () => {
    localStorage.removeItem('zoom_user_token');
    setToken(null);
    setUser(getGuestUser());
    setShowAuthModal(false);
    triggerToast('Logged out. Continuing as Guest');
  };

  const handleLogin = (authToken, userData) => {
    localStorage.setItem('zoom_user_token', authToken);
    setToken(authToken);
    setShowAuthModal(false);
    if (userData) {
      setUser(userData);
    }
    triggerToast('Successfully Logged In!');
  };

  const updateGuestName = (newName) => {
    setUser((prev) => ({ ...prev, name: newName }));
  };

  const addRecentMeeting = (meetingId, name = 'Meeting Session') => {
    setRecentMeetings((prev) => {
      const exists = prev.some((m) => m.id === meetingId);
      if (exists) return prev;
      return [{ id: meetingId, name, date: 'Just now' }, ...prev];
    });
  };

  // Fetch user profile from backend using token
  useEffect(() => {
    if (!token) {
      setUser(getGuestUser());
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data?.user) {
          setUser(response.data.user);
        } else if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        if (error.response?.status === 401 || error.response?.status === 404) {
          handleLogout();
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        theme,
        toastMsg,
        showAuthModal,
        recentMeetings,
        triggerToast,
        toggleTheme: handleToggleTheme,
        logout: handleLogout,
        login: handleLogin,
        updateGuestName,
        addRecentMeeting,
        openAuthModal: () => setShowAuthModal(true),
        closeAuthModal: () => setShowAuthModal(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
