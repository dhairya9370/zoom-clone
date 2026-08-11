import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Lobby from '../components/Lobby';

export default function LobbyPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, updateGuestName, addRecentMeeting, triggerToast } = useAuth();

  const handleJoinMeetingFromLobby = (id, displayName) => {
    if (displayName && user?.name !== displayName) {
      updateGuestName(displayName);
    }
    addRecentMeeting(id);
    triggerToast(`Joined Meeting`);
    navigate(`/meeting/${id}`);
  };

  const handleCancelLobby = () => {
    navigate('/');
  };

  return (
    <Lobby
      meetingId={meetingId || 'zoom-instant-room'}
      user={user}
      onJoinMeeting={handleJoinMeetingFromLobby}
      onCancel={handleCancelLobby}
      onUpdateGuestName={updateGuestName}
    />
  );
}
