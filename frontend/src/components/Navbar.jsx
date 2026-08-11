import React, { useState, useEffect } from 'react';
import { Video, User, Sparkles, Settings, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar({
  onOpenProfileModal
}) {
  const { user, theme, toggleTheme, logout, openAuthModal, triggerToast } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userStatus, setUserStatus] = useState('Online');

  const isGuest = user?.isGuest;
  const name = user?.name || (isGuest ? 'Guest User' : 'User');
  const email = user?.username || '';
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' • ' +
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = () => {
    const nextStatus = userStatus === 'Online' ? 'Away' : 'Online';
    setUserStatus(nextStatus);
    triggerToast(`Status set to ${nextStatus}`);
  };

  const handleSignOut = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <div className="logo-icon">
          <Video size={22} />
        </div>
        <span>Zoom</span>
      </Link>

      <div className="nav-right">
        <div className="clock-display">
          {timeStr || 'Loading...'}
        </div>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Sign In Button for Guests */}
        {isGuest && (
          <button
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem', height: 38 }}
            onClick={openAuthModal}
          >
            <LogIn size={16} /> Sign In
          </button>
        )}

        {/* Profile Button & Menu */}
        <div className="profile-wrapper">
          <button
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="User Profile"
          >
            <div className="avatar">
              {initial}
              <span
                className="status-dot"
                style={{ backgroundColor: userStatus === 'Online' ? '#22c55e' : '#f59e0b' }}
              ></span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="user-info-header">
                <div className="avatar" style={{ width: 44, height: 44, fontSize: '1.2rem' }}>
                  {initial}
                </div>
                <div className="user-details">
                  <h4>{name}</h4>
                  <p>{email}</p>
                </div>
              </div>

              <button
                className="dropdown-item"
                onClick={() => {
                  onOpenProfileModal();
                  setShowProfileMenu(false);
                }}
              >
                <User size={16} /> Profile Details
              </button>

              <button className="dropdown-item" onClick={handleToggleStatus}>
                <Sparkles size={16} /> Status: <strong>{userStatus}</strong>
              </button>

              <button className="dropdown-item" onClick={() => triggerToast('Settings opened')}>
                <Settings size={16} /> Settings
              </button>

              {isGuest ? (
                <button
                  className="dropdown-item"
                  style={{ color: '#38bdf8' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    openAuthModal();
                  }}
                >
                  <LogIn size={16} /> Sign In / Register
                </button>
              ) : (
                <button className="dropdown-item danger" onClick={handleSignOut}>
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
