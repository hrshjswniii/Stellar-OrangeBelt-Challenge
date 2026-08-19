import React from 'react';
import { Award, Trophy, Star, ShieldAlert } from 'lucide-react';

export default function ReputationLeaderboard({ leaderboard }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Trophy size={18} className="text-gradient" />
        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Soroban Reputation Scores</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {leaderboard.map((user) => (
          <div
            key={user.address}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: 'rgba(11, 15, 25, 0.6)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: user.rank === 1 ? '#f59e0b' : 'var(--text-dim)',
                  width: '18px',
                }}
              >
                #{user.rank}
              </span>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'block' }}>{user.address}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {user.successfulDeals} deals • {user.totalVolume}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '800' }}>
                <Star size={12} fill="#f59e0b" />
                <span>{user.score}</span>
              </div>
              {user.disputes > 0 ? (
                <span style={{ fontSize: '0.65rem', color: '#fb7185', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ShieldAlert size={10} /> {user.disputes} Dispute
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', color: '#34d399' }}>100% Clean Record</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
