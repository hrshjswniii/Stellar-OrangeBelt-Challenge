import React from 'react';
import { X, FileCode, CheckCircle2, Copy, ExternalLink, Network } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../services/mockData';

export default function ContractInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCode size={20} className="text-gradient" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Soroban Smart Contract Specs</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: '700', color: '#38bdf8' }}>Marketplace Contract</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Active</span>
            </div>
            <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {CONTRACT_ADDRESSES.marketplace}
            </code>
          </div>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: '700', color: '#c084fc' }}>Escrow Contract</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Active</span>
            </div>
            <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {CONTRACT_ADDRESSES.escrow}
            </code>
          </div>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: '700', color: '#f59e0b' }}>Reputation Contract</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Active</span>
            </div>
            <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {CONTRACT_ADDRESSES.reputation}
            </code>
          </div>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: '700', color: '#34d399' }}>Transaction Deployment Hash</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Testnet</span>
            </div>
            <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {CONTRACT_ADDRESSES.deployTxHash}
            </code>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
