import React from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, Scale, Clock, Lock } from 'lucide-react';
import { formatAmount } from '../services/sorobanClient';

export default function EscrowCard({
  escrow,
  currentRole,
  onSubmitWork,
  onApprovePayment,
  onRaiseDispute,
  onResolveDispute,
}) {
  const getBadge = (status) => {
    switch (status) {
      case 'Funded':
        return <span className="badge badge-funded"><Lock size={12} /> Funds Locked</span>;
      case 'WorkSubmitted':
        return <span className="badge badge-submitted"><Clock size={12} /> Work Submitted</span>;
      case 'Approved':
        return <span className="badge badge-approved"><CheckCircle size={12} /> Approved & Paid</span>;
      case 'Disputed':
        return <span className="badge badge-disputed"><AlertTriangle size={12} /> Under Dispute</span>;
      case 'Resolved':
        return <span className="badge badge-resolved"><Scale size={12} /> Arbitrated</span>;
      case 'Refunded':
        return <span className="badge badge-disputed"><Scale size={12} /> Buyer Refunded</span>;
      default:
        return <span className="badge badge-funded">{status}</span>;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            ESCROW #{escrow.id}
          </span>
          {getBadge(escrow.status)}
        </div>

        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
          {formatAmount(escrow.amount)} XLM
        </span>
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#f8fafc' }}>
        {escrow.serviceTitle}
      </h4>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(11, 15, 25, 0.6)',
          padding: '0.6rem 0.8rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          marginBottom: '1rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block' }}>Buyer</span>
          <strong style={{ color: 'var(--text-muted)' }}>{escrow.buyer}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block' }}>Seller</span>
          <strong style={{ color: 'var(--text-muted)' }}>{escrow.seller}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block' }}>Arbitrator</span>
          <strong style={{ color: 'var(--text-muted)' }}>{escrow.arbitrator}</strong>
        </div>
      </div>

      {escrow.workDetails && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
          "{escrow.workDetails}"
        </p>
      )}

      {/* Action Buttons based on Role & State */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {/* Seller Actions */}
        {currentRole?.toLowerCase().includes('seller') && escrow.status === 'Funded' && (
          <button className="btn btn-warning" onClick={() => onSubmitWork(escrow.id)}>
            <Clock size={14} />
            <span>Submit Work</span>
          </button>
        )}

        {/* Buyer Actions */}
        {currentRole?.toLowerCase().includes('buyer') && (escrow.status === 'Funded' || escrow.status === 'WorkSubmitted') && (
          <>
            <button className="btn btn-danger" onClick={() => onRaiseDispute(escrow.id)}>
              <AlertTriangle size={14} />
              <span>Raise Dispute</span>
            </button>
            <button className="btn btn-success" onClick={() => onApprovePayment(escrow.id)}>
              <CheckCircle size={14} />
              <span>Approve & Release Funds</span>
            </button>
          </>
        )}

        {/* Arbitrator Actions */}
        {currentRole?.toLowerCase().includes('arbitrator') && escrow.status === 'Disputed' && (
          <>
            <button className="btn btn-secondary" onClick={() => onResolveDispute(escrow.id, false)}>
              <Scale size={14} />
              <span>Refund Buyer</span>
            </button>
            <button className="btn btn-primary" onClick={() => onResolveDispute(escrow.id, true)}>
              <Scale size={14} />
              <span>Release to Seller</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
