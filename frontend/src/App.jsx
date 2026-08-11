import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Toast from './components/Toast';
import ProfileModal from './components/ProfileModal';
import DashboardPage from './pages/DashboardPage';
import LobbyPage from './pages/LobbyPage';
import MeetingPage from './pages/MeetingPage';
import './index.css';

function AppContent() {
  const { theme, toastMsg, showAuthModal, closeAuthModal, login, triggerToast, user, logout, openAuthModal } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();
  const isMeetingRoute = location.pathname.startsWith('/meeting/');

  const handleCopyLink = (code) => {
    navigator.clipboard.writeText(code);
    triggerToast('Meeting Code Copied!');
  };

  return (
    <div className={`app-root ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Toast Notification */}
      <Toast message={toastMsg} />

      {/* Global Navbar Header (Hidden on Meeting page) */}
      {!isMeetingRoute && <Navbar onOpenProfileModal={() => setShowProfileModal(true)} />}

      {/* Modular Routes */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lobby/:meetingId" element={<LobbyPage />} />
        <Route path="/meeting/:meetingId" element={<MeetingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onCopyLink={handleCopyLink}
          onLogout={logout}
          onOpenAuthModal={openAuthModal}
        />
      )}

      {/* Blurred Backdrop Auth Modal */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={closeAuthModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440 }}>
            <Auth onLogin={login} triggerToast={triggerToast} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
