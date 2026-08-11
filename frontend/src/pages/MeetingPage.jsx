import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ActiveMeeting from '../components/ActiveMeeting';

export default function MeetingPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, triggerToast } = useAuth();
  const { socket } = useSocket();

  const handleCopyLink = (code) => {
    navigator.clipboard.writeText(code);
    triggerToast('Meeting Code Copied!');
  };

  const handleEndCall = () => {
    const userName = user?.name || 'Guest User';
    if (socket && meetingId) {
      console.log(`Socket [${socket.id}] emitting leave-room for meeting: ${meetingId}`);
      socket.once("left-room", (data) => {
        console.log(`Socket [${socket.id}] left room: ${meetingId}`);
      });
      socket.emit("leave-room", userName, meetingId);
    }
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = null;
    }
    triggerToast('Left the meeting');
    navigate('/');
  };

  return (
    <ActiveMeeting
      activeCallId={meetingId || 'zoom-room'}
      user={user}
      onCopyLink={handleCopyLink}
      onEndCall={handleEndCall}
    />
  );
}
