import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ActionCards from '../components/ActionCards';
import RecentMeetings from '../components/RecentMeetings';
import CreateMeetingModal from '../components/CreateMeetingModal';
import JoinMeetingModal from '../components/JoinMeetingModal';
import ProfileModal from '../components/ProfileModal';
import { BASE_URL } from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, recentMeetings, triggerToast, logout, openAuthModal } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Helper for copying meeting link
  const handleCopyLink = (code) => {
    navigator.clipboard.writeText(code);
    triggerToast('Meeting Code Copied!');
  };

  // Open Create Meeting Modal
  const handleOpenCreateModal = async () => {
    setLoadingCreate(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = user ? { host_id: user.id } : {};
      const res = await axios.post(`${BASE_URL}/create-meeting`, payload, { headers });
      if (res.data?.meetingCode || res.data?.code) {
        let meetingCode = res.data.meetingCode || res.data.code;
        setCreatedMeetingId(meetingCode);
        setShowCreateModal(true);
      }
    } catch (err) {
      console.warn("Failed to create meeting via API, using fallback code:", err);
      const fallbackCode = 'zoom-' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(100 + Math.random() * 900);
      setCreatedMeetingId(fallbackCode);
      setShowCreateModal(true);
    }
  };

  // Move from Create Modal -> Lobby Route
  const handleStartCreatedMeeting = () => {
    setShowCreateModal(false);
    navigate(`/lobby/${createdMeetingId}`);
  };

  // Move from Join Modal -> Lobby Route
  const handleJoinMeeting = (meetingCode) => {
    setShowJoinModal(false);
    navigate(`/lobby/${meetingCode}`);
  };

  // Rejoin from Recent Meetings -> Lobby Route
  const handleRejoinMeeting = (meetingId) => {
    navigate(`/lobby/${meetingId}`);
  };

  return (
    <main className="dashboard-container">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-text">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Start an instant meeting or join an existing session in seconds.</p>
        </div>
      </section>

      {/* Action Cards: Create & Join */}
      <ActionCards
        onOpenCreate={handleOpenCreateModal}
        onOpenJoin={() => setShowJoinModal(true)}
      />

      {/* Recent Meetings Panel */}
      <RecentMeetings
        meetings={recentMeetings}
        onCopyLink={handleCopyLink}
        onRejoin={handleRejoinMeeting}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          meetingId={createdMeetingId}
          onClose={() => setShowCreateModal(false)}
          onCopyLink={handleCopyLink}
          onStart={handleStartCreatedMeeting}
        />
      )}

      {showJoinModal && (
        <JoinMeetingModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinMeeting}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onCopyLink={handleCopyLink}
          onLogout={logout}
          onOpenAuthModal={openAuthModal}
        />
      )}
    </main>
  );
}
