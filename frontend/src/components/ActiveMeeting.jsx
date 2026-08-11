import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, Share2, PhoneOff, Monitor, MonitorOff, Copy, Pin, Maximize2, Minimize2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const PEER_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

function RemoteVideoTile({ participant, isPinned, onPin, isSpotlight }) {
  const videoRef = useRef(null);
  const tileRef = useRef(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initial = ((participant.name || 'Participant').charAt(0) || 'P').toUpperCase();

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  useEffect(() => {
    if (!participant.stream) return;
    const videoTrack = participant.stream.getVideoTracks()[0];
    if (!videoTrack) {
      setIsVideoMuted(true);
      return;
    }

    const handleMute = () => setIsVideoMuted(true);
    const handleUnmute = () => setIsVideoMuted(false);

    videoTrack.addEventListener('mute', handleMute);
    videoTrack.addEventListener('unmute', handleUnmute);

    setIsVideoMuted(!videoTrack.enabled || videoTrack.muted);

    return () => {
      videoTrack.removeEventListener('mute', handleMute);
      videoTrack.removeEventListener('unmute', handleUnmute);
    };
  }, [participant.stream]);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!tileRef.current) return;
    if (!document.fullscreenElement) {
      tileRef.current.requestFullscreen().catch((err) => console.warn("Fullscreen request error:", err));
    } else {
      document.exitFullscreen().catch((err) => console.warn("Exit fullscreen error:", err));
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (document.fullscreenElement === tileRef.current) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const showAvatar = participant.isVideoOff || isVideoMuted;
  const isSharing = participant.isScreenSharing;

  return (
    <div
      ref={tileRef}
      className={`video-tile ${isPinned ? 'pinned-tile' : ''} ${isSharing ? 'sharing-tile' : ''}`}
      onClick={onPin}
    >
      <div className="video-avatar" style={{ display: showAvatar && !isSharing ? 'flex' : 'none' }}>
        {initial}
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play().catch((e) => console.warn("Remote video play error:", e));
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isSharing || isSpotlight || isPinned ? 'contain' : 'cover',
          borderRadius: '12px',
          objectPosition: 'center',
          display: showAvatar && !isSharing ? 'none' : 'block'
        }}
      />
      <div className="tile-name">
        {participant.name} {isSharing && ' • Sharing Screen'}
      </div>

      <div className="tile-actions">
        {onPin && (
          <button
            className={`tile-action-btn ${isPinned ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            title={isPinned ? "Unpin Spotlight" : "Spotlight Video"}
          >
            <Pin size={16} />
          </button>
        )}
        <button
          className={`tile-action-btn ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}

function LocalVideoTile({
  userName,
  initial,
  isVideoOff,
  isMuted,
  isScreenSharing,
  videoRef,
  isPinned,
  onPin,
  isSpotlight
}) {
  const tileRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!tileRef.current) return;
    if (!document.fullscreenElement) {
      tileRef.current.requestFullscreen().catch((err) => console.warn("Fullscreen request error:", err));
    } else {
      document.exitFullscreen().catch((err) => console.warn("Exit fullscreen error:", err));
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (document.fullscreenElement === tileRef.current) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const showAvatar = isVideoOff && !isScreenSharing;

  return (
    <div
      ref={tileRef}
      className={`video-tile ${isPinned ? 'pinned-tile' : ''} ${isScreenSharing ? 'sharing-tile' : ''}`}
      onClick={onPin}
    >
      <div className="video-avatar" style={{ display: showAvatar ? 'flex' : 'none' }}>
        {initial}
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play().catch((e) => console.warn("Meeting video play error:", e));
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isScreenSharing || isSpotlight || isPinned ? 'contain' : 'cover',
          transform: isScreenSharing ? 'none' : 'scaleX(-1)',
          borderRadius: '12px',
          display: showAvatar ? 'none' : 'block'
        }}
      />
      <div className="tile-name">
        {userName} (You) {isScreenSharing && ' • Sharing Screen'} {isMuted && ' • Muted'}
      </div>

      <div className="tile-actions">
        {onPin && (
          <button
            className={`tile-action-btn ${isPinned ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            title={isPinned ? "Unpin Spotlight" : "Spotlight Video"}
          >
            <Pin size={16} />
          </button>
        )}
        <button
          className={`tile-action-btn ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function ActiveMeeting({ activeCallId, user, onCopyLink, onEndCall }) {
  const { socket } = useSocket();
  const { triggerToast } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(() => {
    if (window.localStream) {
      const track = window.localStream.getVideoTracks()[0];
      return track ? !track.enabled : false;
    }
    return false;
  });
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedId, setPinnedId] = useState(null);
  
  const videoRef = useRef(null);
  const peerConnections = useRef({});
  const iceCandidatesQueue = useRef({});
  const hasEmittedReady = useRef(false);
  const screenStreamRef = useRef(null);

  const userName = user?.name || 'Guest User';
  const initial = (userName.charAt(0) || 'U').toUpperCase();

  // Attach local stream to local videoRef
  useEffect(() => {
    if (!isVideoOff && videoRef.current && window.localStream && !screenStreamRef.current) {
      videoRef.current.srcObject = window.localStream;
    }
  }, [isVideoOff]);

  // Track enabled states for local stream & notify peers via socket
  useEffect(() => {
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });
    }
    if (socket && activeCallId) {
      socket.emit("toggle-video", { roomCode: activeCallId, isVideoOff });
    }
  }, [isVideoOff, socket, activeCallId]);

  useEffect(() => {
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Stop local stream & screen stream tracks on component unmount
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
        window.localStream = null;
      }
    };
  }, []);

  // Screen Sharing Logic
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    const cameraTrack = window.localStream ? window.localStream.getVideoTracks()[0] : null;

    // Swap back to camera video track across all peer connections
    Object.values(peerConnections.current).forEach((pc) => {
      const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(!isVideoOff && cameraTrack ? cameraTrack : null);
      }
    });

    // Reset local video preview to local camera stream
    if (videoRef.current && window.localStream) {
      videoRef.current.srcObject = window.localStream;
    }

    setIsScreenSharing(false);
    setPinnedId((curr) => (curr === 'local' ? null : curr));

    if (socket && activeCallId) {
      socket.emit("toggle-screen-share", { roomCode: activeCallId, isScreenSharing: false });
    }

    triggerToast("Screen sharing stopped");
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false, // Keep mic audio unchanged from localStream
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track across all connected peers
      Object.values(peerConnections.current).forEach((pc) => {
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      // Update local video element to show screen stream
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);
      setPinnedId('local');

      if (socket && activeCallId) {
        socket.emit("toggle-screen-share", { roomCode: activeCallId, isScreenSharing: true });
      }

      triggerToast("Screen sharing started");

      // Automatically revert when user clicks browser's floating "Stop sharing" button
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn("Screen sharing error/cancellation:", err);
      if (err.name !== 'NotAllowedError') {
        triggerToast("Failed to start screen sharing");
      }
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // WebRTC Peer Connection Helper
  const createPeerConnection = (targetSocketId, targetName) => {
    if (peerConnections.current[targetSocketId]) {
      return peerConnections.current[targetSocketId];
    }

    console.log(`Creating RTCPeerConnection for peer [${targetSocketId}] (${targetName})`);
    const pc = new RTCPeerConnection(PEER_CONFIG);
    peerConnections.current[targetSocketId] = pc;

    // 1. Add local stream tracks (or screen track if currently sharing) to WebRTC peer connection
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        if (track.kind === 'video' && screenStreamRef.current) {
          const screenTrack = screenStreamRef.current.getVideoTracks()[0];
          if (screenTrack) {
            pc.addTrack(screenTrack, window.localStream);
            return;
          }
        }
        pc.addTrack(track, window.localStream);
      });
    }

    // 2. Listen for incoming remote stream tracks
    pc.ontrack = (event) => {
      console.log(`Received remote track from [${targetSocketId}]`, event.streams);
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteParticipants((prev) => {
          const existing = prev.find((p) => p.socketId === targetSocketId);
          const isOff = existing ? existing.isVideoOff : false;
          const isSharing = existing ? existing.isScreenSharing : false;
          const filtered = prev.filter((p) => p.socketId !== targetSocketId);
          return [...filtered, { socketId: targetSocketId, name: targetName || 'Participant', stream: remoteStream, isVideoOff: isOff, isScreenSharing: isSharing }];
        });
      }
    };

    // 3. Listen for ICE network candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("signal-candidate", { to: targetSocketId, candidate: event.candidate });
      }
    };

    // 4. Monitor WebRTC connection state
    pc.onconnectionstatechange = () => {
      console.log(`WebRTC connection state with [${targetSocketId}]:`, pc.connectionState);
    };

    return pc;
  };

  // Helper to flush queued ICE candidates after remote description is set
  const processIceQueue = async (fromSocketId, pc) => {
    if (iceCandidatesQueue.current[fromSocketId]) {
      const queue = iceCandidatesQueue.current[fromSocketId];
      delete iceCandidatesQueue.current[fromSocketId];
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Error processing queued ICE candidate:", e);
        }
      }
    }
  };

  // Socket.IO WebRTC Signaling & Event Listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new participant joining room -> Trigger Toast & Create Offer (ONCE)
    const handleNewUserJoined = async ({ name, socketId, isVideoOff: remoteVideoOff }) => {
      if (socketId === socket.id) return;
      
      // Prevent duplicate offers if connection already established
      if (peerConnections.current[socketId]) {
        console.log(`Peer connection for [${socketId}] already exists. Skipping duplicate join offer.`);
        return;
      }

      console.log(`New user joined call [${name}] (${socketId}), videoOff: ${remoteVideoOff}. Creating WebRTC offer.`);
      
      if (name) {
        triggerToast(`User ${name} joined the call`);
      } else {
        triggerToast("Someone joined the call");
      }

      setRemoteParticipants((prev) => {
        const existing = prev.find((p) => p.socketId === socketId);
        if (!existing) {
          return [...prev, { socketId, name: name || 'Participant', stream: null, isVideoOff: !!remoteVideoOff, isScreenSharing: false }];
        }
        return prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff: !!remoteVideoOff } : p));
      });

      const pc = createPeerConnection(socketId, name);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal-offer", { to: socketId, offer, name: userName, isVideoOff });
      } catch (err) {
        console.warn("Error creating WebRTC offer:", err);
      }
    };

    // Handle incoming WebRTC Offer -> Create Answer
    const handleSignalOffer = async ({ from, offer, name, isVideoOff: remoteVideoOff }) => {
      if (from === socket.id) return;
      console.log(`Received WebRTC offer from [${name}] (${from}), videoOff: ${remoteVideoOff}. Creating WebRTC answer.`);
      
      setRemoteParticipants((prev) => {
        const existing = prev.find((p) => p.socketId === from);
        if (!existing) {
          return [...prev, { socketId: from, name: name || 'Participant', stream: null, isVideoOff: !!remoteVideoOff, isScreenSharing: false }];
        }
        return prev.map((p) => (p.socketId === from ? { ...p, isVideoOff: !!remoteVideoOff } : p));
      });

      const pc = createPeerConnection(from, name);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processIceQueue(from, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal-answer", { to: from, answer, isVideoOff });
      } catch (err) {
        console.warn("Error handling WebRTC offer:", err);
      }
    };

    // Handle incoming WebRTC Answer -> Set Remote Description
    const handleSignalAnswer = async ({ from, answer, isVideoOff: remoteVideoOff }) => {
      console.log(`Received WebRTC answer from [${from}]`);
      if (remoteVideoOff !== undefined) {
        setRemoteParticipants((prev) =>
          prev.map((p) => (p.socketId === from ? { ...p, isVideoOff: !!remoteVideoOff } : p))
        );
      }
      const pc = peerConnections.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await processIceQueue(from, pc);
        } catch (err) {
          console.warn("Error setting remote description answer:", err);
        }
      }
    };

    // Handle incoming video toggle from remote user
    const handleUserToggleVideo = ({ socketId, isVideoOff: remoteVideoOff }) => {
      console.log(`Participant [${socketId}] toggled video to: ${remoteVideoOff}`);
      setRemoteParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isVideoOff: !!remoteVideoOff } : p))
      );
    };

    // Handle incoming screen share toggle from remote user
    const handleUserToggleScreenShare = ({ socketId, isScreenSharing: remoteSharing }) => {
      console.log(`Participant [${socketId}] toggled screen sharing: ${remoteSharing}`);
      setRemoteParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, isScreenSharing: !!remoteSharing } : p))
      );
      if (remoteSharing) {
        setPinnedId(socketId);
        triggerToast("A participant started sharing their screen");
      } else {
        setPinnedId((curr) => (curr === socketId ? null : curr));
      }
    };

    // Handle incoming ICE Candidate -> Add Candidate or Queue
    const handleSignalCandidate = async ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (candidate) {
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn("Error adding ICE candidate:", err);
          }
        } else {
          // Queue candidate until remote description is set
          if (!iceCandidatesQueue.current[from]) {
            iceCandidatesQueue.current[from] = [];
          }
          iceCandidatesQueue.current[from].push(candidate);
        }
      }
    };

    // Handle user leaving room -> Trigger Toast & Cleanup peer connection
    const handleUserLeftRoom = ({ name, socketId }) => {
      console.log(`Participant [${socketId}] left room. Closing peer connection.`);
      
      if (name) {
        triggerToast(`User ${name} left the call`);
      } else {
        triggerToast("Someone left the call");
      }

      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      if (iceCandidatesQueue.current[socketId]) {
        delete iceCandidatesQueue.current[socketId];
      }
      setRemoteParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      setPinnedId((curr) => (curr === socketId ? null : curr));
    };

    socket.on("new-user-joined", handleNewUserJoined);
    socket.on("signal-offer", handleSignalOffer);
    socket.on("signal-answer", handleSignalAnswer);
    socket.on("user-toggle-video", handleUserToggleVideo);
    socket.on("user-toggle-screen-share", handleUserToggleScreenShare);
    socket.on("signal-candidate", handleSignalCandidate);
    socket.on("user-left-room", handleUserLeftRoom);

    // Signal to existing meeting participants that this socket is mounted & ready (ONCE)
    if (activeCallId && !hasEmittedReady.current) {
      hasEmittedReady.current = true;
      console.log(`Emitting ready-in-room for user [${userName}] in room [${activeCallId}], videoOff: ${isVideoOff}`);
      socket.emit("ready-in-room", userName, activeCallId, isVideoOff);
    }

    return () => {
      socket.off("new-user-joined", handleNewUserJoined);
      socket.off("signal-offer", handleSignalOffer);
      socket.off("signal-answer", handleSignalAnswer);
      socket.off("user-toggle-video", handleUserToggleVideo);
      socket.off("user-toggle-screen-share", handleUserToggleScreenShare);
      socket.off("signal-candidate", handleSignalCandidate);
      socket.off("user-left-room", handleUserLeftRoom);

      // Clean up all peer connections on component unmount
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      iceCandidatesQueue.current = {};
    };
  }, [socket, activeCallId, userName]);

  // Determine active spotlight (either pinned user OR active screen share)
  const remoteScreenSharer = remoteParticipants.find((p) => p.isScreenSharing);

  let activeSpotlightId = pinnedId;
  if (!activeSpotlightId) {
    if (isScreenSharing) {
      activeSpotlightId = 'local';
    } else if (remoteScreenSharer) {
      activeSpotlightId = remoteScreenSharer.socketId;
    }
  }

  const handlePinToggle = (id) => {
    setPinnedId((curr) => (curr === id ? null : id));
  };

  const spotlightParticipant = remoteParticipants.find((p) => p.socketId === activeSpotlightId);

  return (
    <div className="active-meeting-container">
      {activeSpotlightId ? (
        /* Spotlight & Screen Share Layout */
        <div className="spotlight-stage-container">
          <div className="spotlight-main-area">
            {activeSpotlightId === 'local' ? (
              <LocalVideoTile
                userName={userName}
                initial={initial}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                isScreenSharing={isScreenSharing}
                videoRef={videoRef}
                isPinned={pinnedId === 'local'}
                onPin={() => handlePinToggle('local')}
                isSpotlight={true}
              />
            ) : spotlightParticipant ? (
              <RemoteVideoTile
                participant={spotlightParticipant}
                isPinned={pinnedId === spotlightParticipant.socketId}
                onPin={() => handlePinToggle(spotlightParticipant.socketId)}
                isSpotlight={true}
              />
            ) : null}
          </div>

          <div className="spotlight-sidebar">
            {activeSpotlightId !== 'local' && (
              <LocalVideoTile
                userName={userName}
                initial={initial}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                isScreenSharing={isScreenSharing}
                videoRef={videoRef}
                isPinned={pinnedId === 'local'}
                onPin={() => handlePinToggle('local')}
                isSpotlight={false}
              />
            )}
            {remoteParticipants
              .filter((p) => p.socketId !== activeSpotlightId)
              .map((participant) => (
                <RemoteVideoTile
                  key={participant.socketId}
                  participant={participant}
                  isPinned={pinnedId === participant.socketId}
                  onPin={() => handlePinToggle(participant.socketId)}
                  isSpotlight={false}
                />
              ))}
          </div>
        </div>
      ) : (
        /* Standard Equal Grid Layout */
        <div className="video-grid">
          <LocalVideoTile
            userName={userName}
            initial={initial}
            isVideoOff={isVideoOff}
            isMuted={isMuted}
            isScreenSharing={isScreenSharing}
            videoRef={videoRef}
            isPinned={pinnedId === 'local'}
            onPin={() => handlePinToggle('local')}
            isSpotlight={false}
          />
          {remoteParticipants.map((participant) => (
            <RemoteVideoTile
              key={participant.socketId}
              participant={participant}
              isPinned={pinnedId === participant.socketId}
              onPin={() => handlePinToggle(participant.socketId)}
              isSpotlight={false}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Control Toolbar */}
      <div className="meeting-controls">
        <button
          className={`ctrl-btn ${isMuted ? 'off' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          className={`ctrl-btn ${isVideoOff ? 'off' : ''}`}
          onClick={() => setIsVideoOff(!isVideoOff)}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
        </button>

        <button
          className={`ctrl-btn ${isScreenSharing ? 'active-share' : ''}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>

        <button
          className="ctrl-btn"
          onClick={() => onCopyLink(activeCallId)}
          title="Copy Meeting Link"
        >
          <Copy size={20} />
        </button>

        <button className="ctrl-btn end" onClick={onEndCall}>
          <PhoneOff size={20} style={{ marginRight: 6 }} /> End
        </button>
      </div>
    </div>
  );
}
