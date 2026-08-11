import React from 'react';
import { Video, PlusSquare } from 'lucide-react';

export default function ActionCards({ onOpenCreate, onOpenJoin }) {
  return (
    <section className="actions-grid">
      {/* Create Meeting Card */}
      <div className="action-card" onClick={onOpenCreate}>
        <div className="action-icon create">
          <Video size={28} />
        </div>
        <div className="action-info">
          <h3>New Meeting</h3>
          <p>Create an instant meeting room and invite others</p>
        </div>
        <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #ff7425, #f53855)' }}>
          <Video size={16} /> Create Meeting
        </button>
      </div>

      {/* Join Meeting Card */}
      <div className="action-card" onClick={onOpenJoin}>
        <div className="action-icon join">
          <PlusSquare size={28} />
        </div>
        <div className="action-info">
          <h3>Join Meeting</h3>
          <p>Enter a meeting code or link to join an active room</p>
        </div>
        <button className="btn-primary">
          <PlusSquare size={16} /> Join Meeting
        </button>
      </div>
    </section>
  );
}
