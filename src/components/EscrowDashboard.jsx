import React, { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, Coins, Filter } from 'lucide-react';
import EscrowCard from './EscrowCard';
import { formatAmount } from '../services/sorobanClient';

export default function EscrowDashboard({
  escrows,
  currentRole,
  onSubmitWork,
  onApprovePayment,
  onRaiseDispute,
  onResolveDispute,
}) {
  const [filter, setFilter] = useState('ALL');

  const tvl = escrows
    .filter((e) => e.status === 'Funded' || e.status === 'WorkSubmitted' || e.status === 'Disputed')
    .reduce((sum, e) => sum + e.amount, 0);

  const activeCount = escrows.filter(
    (e) => e.status === 'Funded' || e.status === 'WorkSubmitted' || e.status === 'Disputed'
  ).length;

  const completedCount = escrows.filter(
    (e) => e.status === 'Approved' || e.status === 'Resolved' || e.status === 'Refunded'
  ).length;

  const disputedCount = escrows.filter((e) => e.status === 'Disputed').length;

  const filteredEscrows = escrows.filter((e) => {
    if (filter === 'ACTIVE') return e.status === 'Funded' || e.status === 'WorkSubmitted';
    if (filter === 'DISPUTED') return e.status === 'Disputed';
    if (filter === 'COMPLETED') return e.status === 'Approved' || e.status === 'Resolved' || e.status === 'Refunded';
    return true;
  });

  return (
    <div>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>TOTAL VALUE LOCKED</span>
            <Coins size={16} className="text-gradient" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            {formatAmount(tvl)} XLM
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>ACTIVE ESCROWS</span>
            <Lock size={16} style={{ color: '#c084fc' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
            {activeCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>COMPLETED DEALS</span>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            {completedCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>DISPUTES</span>
            <AlertTriangle size={16} style={{ color: '#f43f5e' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
            {disputedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Soroban Escrow Management</h3>
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px' }}>
          {['ALL', 'ACTIVE', 'DISPUTED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                background: filter === tab ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                color: filter === tab ? '#c084fc' : 'var(--text-muted)',
                border: filter === tab ? '1px solid rgba(139, 92, 246, 0.4)' : 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Escrows List */}
      {filteredEscrows.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No escrow accounts found matching filter.
        </div>
      ) : (
        filteredEscrows.map((escrow) => (
          <EscrowCard
            key={escrow.id}
            escrow={escrow}
            currentRole={currentRole}
            onSubmitWork={onSubmitWork}
            onApprovePayment={onApprovePayment}
            onRaiseDispute={onRaiseDispute}
            onResolveDispute={onResolveDispute}
          />
        ))
      )}
    </div>
  );
}
