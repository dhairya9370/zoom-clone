import React from 'react';
import { Clock, Copy, LogIn } from 'lucide-react';

export default function RecentMeetings({ meetings, onCopyLink, onRejoin }) {
  if (!meetings || meetings.length === 0) return null;

  return (
    <section className="info-section">
      <h3 className="section-title">Recent Meetings</h3>
      <div className="meeting-list">
        {meetings.map((m, index) => (
          <div key={index} className="meeting-item">
            <div className="meeting-meta">
              <div className="clock-icon-badge">
                <Clock size={16} />
              </div>
              <div className="meeting-info-text">
                <strong className="meeting-title">{m.name}</strong>
                <span className="meeting-date">{m.date}</span>
              </div>
            </div>
            <div className="meeting-item-actions">
              <span className="meeting-code" title={m.id}>
                {m.id}
              </span>
              <div className="meeting-btn-group">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onCopyLink(m.id)}
                  title="Copy Meeting Link"
                >
                  <Copy size={13} /> Copy
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onRejoin(m.id)}
                >
                  <LogIn size={13} /> Rejoin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
