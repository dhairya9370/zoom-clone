import React from 'react';
import { X, Copy, Video } from 'lucide-react';

export default function CreateMeetingModal({ meetingId, onClose, onCopyLink, onStart }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Meeting</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="input-group">
          <label>Meeting ID</label>
          <div className="code-box">
            <span>{meetingId}</span>
            <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => onCopyLink(meetingId)}>
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Share this code with participants so they can join your meeting.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #ff7425, #f53855)' }}
            onClick={onStart}
          >
            <Video size={16} /> Start Instant Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
