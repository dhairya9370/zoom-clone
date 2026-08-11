import React from 'react';
import { X, Copy, LogOut, LogIn } from 'lucide-react';

export default function ProfileModal({ user, onClose, onCopyLink, onLogout, onOpenAuthModal }) {
  const isGuest = user?.isGuest;
  const name = user?.name || 'Guest User';
  const email = user?.username || '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.8rem' }}>
            {initial}
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>{name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{email}</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 4,
                background: isGuest ? 'rgba(245, 158, 11, 0.2)' : 'rgba(14, 113, 235, 0.2)',
                color: isGuest ? '#f59e0b' : '#38bdf8',
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {isGuest ? 'Guest Account' : 'Pro Account'}
            </span>
          </div>
        </div>

        <div className="input-group">
          <label>Personal Meeting Link</label>
          <div className="code-box" style={{ fontSize: '0.9rem' }}>
            <span>https://localhost:5173/pmi/coming-soon</span>
            <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => onCopyLink('pmi/coming-soon')}>
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          {isGuest ? (
            <button
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal();
              }}
            >
              <LogIn size={16} /> Sign In / Register
            </button>
          ) : (
            <button
              className="dropdown-item danger"
              style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              onClick={onLogout}
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
