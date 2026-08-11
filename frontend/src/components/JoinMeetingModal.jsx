import React, { useState } from 'react';
import axios from 'axios';
import { X, PlusSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';

export default function JoinMeetingModal({ onClose, onJoin }) {
  const { triggerToast } = useAuth();
  const [meetingIdInput, setMeetingIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = meetingIdInput.trim();
    if (!code || isVerifying) return;

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await axios.post(`${BASE_URL}/verify-meeting`, { code });
      if (res?.data?.success) {
        if (triggerToast) triggerToast("Meeting verified successfully!");
        onJoin(code);
      } else {
        setErrorMsg(res?.data?.message || "Invalid meeting code.");
      }
    } catch (error) {
      console.warn("Meeting verification error:", error);
      const msg = error.response?.data?.message || "Meeting not found or invalid code.";
      setErrorMsg(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join a Meeting</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>Meeting ID or Link</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. zoom-849-204-192"
              value={meetingIdInput}
              onChange={(e) => {
                setMeetingIdInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              autoFocus
            />
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isVerifying}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!meetingIdInput.trim() || isVerifying}>
              {isVerifying ? <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> : <PlusSquare size={16} />}
              <span>{isVerifying ? 'Verifying...' : 'Join'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

