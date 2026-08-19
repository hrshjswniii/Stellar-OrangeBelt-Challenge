import React from 'react';
import { Radio, Terminal } from 'lucide-react';

export default function EventLogStream({ events }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={16} style={{ color: '#06b6d4' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Soroban Real-Time Event Stream</h3>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span>
          LIVE CONNECTION
        </span>
      </div>

      <div
        style={{
          background: '#070a12',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '0.85rem',
          maxHeight: '180px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
        id="event-log-container"
      >
        {events.length === 0 ? (
          <div style={{ color: 'var(--text-dim)' }}>Listening for Soroban contract events...</div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} style={{ color: evt.color || '#38bdf8', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>[{evt.timestamp}]</span>
              <strong style={{ color: '#a78bfa' }}>{evt.type}:</strong>
              <span>{evt.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
