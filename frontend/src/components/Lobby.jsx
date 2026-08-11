import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  Settings,
  Copy,
  Check,
  Video,
  ArrowLeft,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Lobby({ meetingId, user, onJoinMeeting, onCancel, onUpdateGuestName }) {
  const { socket } = useSocket();
  const [displayName, setDisplayName] = useState(user?.name || 'Guest User');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedMic, setSelectedMic] = useState('default-mic');
  const [selectedCamera, setSelectedCamera] = useState('default-cam');
  const [selectedSpeaker, setSelectedSpeaker] = useState('default-speaker');
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const [micList, setMicList] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [speakerList, setSpeakerList] = useState([]);

  const localVideoRef = useRef(null);

  // Synchronize local display name state if user prop updates
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user]);

  // Audio test simulation timer
  useEffect(() => {
    let timer;
    if (isTestingAudio) {
      timer = setTimeout(() => {
        setIsTestingAudio(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isTestingAudio]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const finalName = displayName.trim() || 'Guest User';
    if (onUpdateGuestName && finalName !== user?.name) {
      onUpdateGuestName(finalName);
    }

    if (socket && meetingId) {
      console.log(`Socket [${socket.id}] emitting join-room for meeting: ${meetingId}`);
      socket.emit("join-room", finalName, meetingId);

      const handleRoomJoined = (data) => {
        if (data.success) {
          console.log("Joined room successfully via Socket.IO:", data.code);
        } else {
          console.warn("Socket room join failed:", data.error);
        }
        socket.off("room-joined", handleRoomJoined);
      };

      socket.on("room-joined", handleRoomJoined);
    }

    onJoinMeeting(meetingId, finalName, { isMuted, isVideoOff, selectedMic, selectedCamera, selectedSpeaker });
  };

  const playTestSound = () => {
    setIsTestingAudio(true);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Harmonious test chime melody (A4 to A5 note shift)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.8);

        setTimeout(() => {
          try { ctx.close(); } catch (e) { }
          setIsTestingAudio(false);
        }, 1000);
      } else {
        setTimeout(() => setIsTestingAudio(false), 2000);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
      setTimeout(() => setIsTestingAudio(false), 2000);
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${idx + 1}`
        }));
      const cameras = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1}`
        }));
      const speakers = devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker ${idx + 1}`
        }));

      setMicList(mics);
      setCameraList(cameras);
      setSpeakerList(speakers);

      if (mics.length > 0 && selectedMic === 'default-mic') {
        setSelectedMic(mics[0].deviceId);
      }
      if (cameras.length > 0 && selectedCamera === 'default-cam') {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (speakers.length > 0 && selectedSpeaker === 'default-speaker') {
        setSelectedSpeaker(speakers[0].deviceId);
      }
    } catch (e) {
      console.warn("Could not enumerate devices:", e);
    }
  };

  const handleCameraChange = async (deviceId) => {
    setSelectedCamera(deviceId);
    if (!deviceId) return;
    try {
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => track.stop());
      }
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      if (window.localStream && newVideoTrack) {
        window.localStream.getVideoTracks().forEach((t) => window.localStream.removeTrack(t));
        window.localStream.addTrack(newVideoTrack);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
      }
    } catch (err) {
      console.warn("Failed to switch camera device:", err);
    }
  };

  const handleMicChange = async (deviceId) => {
    setSelectedMic(deviceId);
    if (!deviceId) return;
    try {
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((track) => track.stop());
      }
      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      if (window.localStream && newAudioTrack) {
        window.localStream.getAudioTracks().forEach((t) => window.localStream.removeTrack(t));
        window.localStream.addTrack(newAudioTrack);
      }
    } catch (err) {
      console.warn("Failed to switch mic device:", err);
    }
  };

  const handleSpeakerChange = async (deviceId) => {
    setSelectedSpeaker(deviceId);
    if (localVideoRef.current && typeof localVideoRef.current.setSinkId === 'function') {
      try {
        await localVideoRef.current.setSinkId(deviceId);
      } catch (err) {
        console.warn("Speaker sink ID error:", err);
      }
    }
  };

  const getPermissions = async () => {
    let videoStream = null;
    let audioStream = null;

    // 1. Ask for Video permission & set video stream
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoStream) {
        setVideoAvailable(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
        }
      }
    } catch (vErr) {
      console.warn("Video permission denied:", vErr);
      setVideoAvailable(false);
    }

    // 2. Ask for Audio permission
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioStream) {
        setAudioAvailable(true);
      }
    } catch (aErr) {
      console.warn("Audio permission denied:", aErr);
      setAudioAvailable(false);
    }

    // 3. Combine active tracks into window.localStream
    const activeTracks = [
      ...(videoStream ? videoStream.getVideoTracks() : []),
      ...(audioStream ? audioStream.getAudioTracks() : [])
    ];

    if (activeTracks.length > 0) {
      window.localStream = new MediaStream(activeTracks);
    } else {
      window.localStream = null;
    }

    await getDevices();
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // Ensure localVideoRef receives the active stream when video mode is rendered
  useEffect(() => {
    if (!isVideoOff && localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [isVideoOff, videoAvailable]);

  // Real-time microphone voice volume analyser using Web Audio API
  useEffect(() => {
    if (isMuted || !audioAvailable || !window.localStream) {
      setMicLevel(0);
      return;
    }

    const audioTracks = window.localStream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      setMicLevel(0);
      return;
    }

    let audioCtx;
    let analyser;
    let microphone;
    let animFrameId;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;

      microphone = audioCtx.createMediaStreamSource(window.localStream);
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 64) * 100));
        setMicLevel(normalized);
        animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn("Mic volume analyser error:", e);
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (microphone) microphone.disconnect();
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) { }
      }
    };
  }, [isMuted, audioAvailable]);

  // Toggle video track state
  useEffect(() => {
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff]);

  // Toggle audio track state
  useEffect(() => {
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Extract initial for avatar display
  const userInitial = (displayName.charAt(0) || 'G').toUpperCase();

  return (
    <div className="lobby-container">
      {/* Header Bar */}
      <div className="lobby-header">
        <button className="lobby-back-btn" onClick={onCancel} title="Back to Dashboard">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <div className="lobby-meeting-tag">
          <span className="tag-label">Ready to join</span>
          <code className="meeting-code-badge">{meetingId}</code>
          <button className="copy-code-btn" onClick={handleCopyCode} title="Copy Meeting Code">
            {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      <div className="lobby-grid">
        {/* Left Column: Media Verification Tile */}
        <div className="lobby-preview-card">
          <div className="lobby-preview-box">
            {isVideoOff ? (
              <div className="preview-avatar-wrap">
                <div className="preview-avatar">{userInitial}</div>
                <p className="preview-status-msg">Camera is turned off</p>
              </div>
            ) : (
              <div className="preview-active-wrap">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={() => {
                    if (localVideoRef.current) {
                      localVideoRef.current.play().catch(e => console.warn("Video play error:", e));
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    borderRadius: '12px'
                  }}
                />
                <div className="preview-camera-overlay">
                  <div className="cam-badge">
                    <span className="live-dot"></span>
                    <span>Camera Preview (Active)</span>
                  </div>
                  {isMuted && <span className="muted-badge">Mic Off</span>}
                </div>
              </div>
            )}

            {/* Mic Audio Level Visualizer (Real-time voice input volume) */}
            {!isMuted && (
              <div className="mic-level-bar-container">
                <div className="mic-level-label">
                  <Volume2 size={13} style={{ color: micLevel > 8 ? '#22c55e' : '#94a3b8' }} />
                  <span>Mic Level</span>
                </div>
                <div className="mic-level-bars">
                  {[0.6, 0.9, 1.2, 0.9, 0.6].map((multiplier, idx) => {
                    const heightPercent = Math.max(15, Math.min(100, micLevel * multiplier));
                    return (
                      <span
                        key={idx}
                        className="bar"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: micLevel > 5 ? '#22c55e' : '#64748b',
                          transition: 'height 0.06s ease, background-color 0.15s ease'
                        }}
                      ></span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Floating Quick Media Controls */}
            <div className="preview-quick-controls">
              <button
                type="button"
                className={`quick-ctrl-btn ${isMuted ? 'muted' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="button"
                className={`quick-ctrl-btn ${isVideoOff ? 'muted' : ''}`}
                onClick={() => setIsVideoOff(!isVideoOff)}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
              </button>
            </div>
          </div>

          <div className="lobby-audio-test-row">
            <button
              type="button"
              className={`btn-test-audio ${isTestingAudio ? 'testing' : ''}`}
              onClick={playTestSound}
            >
              <Sparkles size={16} />
              <span>{isTestingAudio ? 'Playing Test Chime...' : 'Test Speaker & Mic'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Guest Name & Device Preferences */}
        <div className="lobby-settings-card">
          <div className="lobby-card-header">
            <h2>Join Meeting</h2>
            <p>Verify your name and hardware settings before .</p>
          </div>

          <form onSubmit={handleJoin} className="lobby-form">
            {/* Display Name Input */}
            <div className="input-group">
              <div className="label-row">
                <label htmlFor="guestDisplayName">Your Name</label>
                {user?.isGuest ? (
                  <span className="guest-badge">Guest User</span>
                ) : (
                  <span className="user-badge"><UserCheck size={12} /> Logged In</span>
                )}
              </div>
              <input
                id="guestDisplayName"
                type="text"
                className="input-field name-input"
                placeholder="Enter your name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <span className="input-hint">
                This name will be visible to everyone in the meeting.
              </span>
            </div>

            {/* Hardware Selectors */}
            <div className="device-selectors">
              <h3><Settings size={15} /> Media Devices</h3>

              <div className="select-field-group">
                <label htmlFor="micSelect">Microphone</label>
                <select
                  id="micSelect"
                  className="input-field select-field"
                  value={selectedMic}
                  onChange={(e) => handleMicChange(e.target.value)}
                >
                  {micList.length > 0 ? (
                    micList.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>
                        {m.label}
                      </option>
                    ))
                  ) : (
                    <option value="default-mic">Default - Built-in Microphone</option>
                  )}
                </select>
              </div>

              <div className="select-field-group">
                <label htmlFor="camSelect">Camera</label>
                <select
                  id="camSelect"
                  className="input-field select-field"
                  value={selectedCamera}
                  onChange={(e) => handleCameraChange(e.target.value)}
                >
                  {cameraList.length > 0 ? (
                    cameraList.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label}
                      </option>
                    ))
                  ) : (
                    <option value="default-cam">Integrated HD Webcam (1080p)</option>
                  )}
                </select>
              </div>

              <div className="select-field-group">
                <label htmlFor="speakerSelect">Speakers</label>
                <select
                  id="speakerSelect"
                  className="input-field select-field"
                  value={selectedSpeaker}
                  onChange={(e) => handleSpeakerChange(e.target.value)}
                >
                  {speakerList.length > 0 ? (
                    speakerList.map((s) => (
                      <option key={s.deviceId} value={s.deviceId}>
                        {s.label}
                      </option>
                    ))
                  ) : (
                    <option value="default-speaker">Default - System Speakers</option>
                  )}
                </select>
              </div>
            </div>

            {/* Quick Checkbox Options */}
            <div className="lobby-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                />
                <span>Don't connect audio on start</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isVideoOff}
                  onChange={(e) => setIsVideoOff(e.target.checked)}
                />
                <span>Turn off video on start</span>
              </label>
            </div>

            {/* Join Actions */}
            <div className="lobby-actions">
              <button type="button" className="btn-secondary btn-cancel-lobby" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-join-lobby">
                <Video size={18} />
                <span>Join Meeting Now</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
