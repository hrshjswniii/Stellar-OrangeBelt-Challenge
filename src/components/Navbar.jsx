import React from 'react';
import { ShieldCheck, Wallet, PlusCircle, FileCode } from 'lucide-react';
import { formatAmount } from '../services/sorobanClient';

export default function Navbar({
  wallet,
  onSwitchRole,
  onOpenCreateListing,
  onOpenContractInfo,
}) {
  return (
    <header className="navbar">
      <div className="brand-logo">
        <div className="logo-badge">
          <ShieldCheck size={24} />
        </div>
        <span>Stellar Escrow Marketplace</span>
      </div>

      <div className="nav-controls">
        <button
          className="btn btn-secondary"
          onClick={onOpenContractInfo}
          title="View Soroban Contract Addresses & Verification"
        >
          <FileCode size={16} className="text-muted" />
          <span>Contract Specs</span>
        </button>

        <button className="btn btn-primary" onClick={onOpenCreateListing}>
          <PlusCircle size={16} />
          <span>List Service</span>
        </button>

        {/* Role Selector Pill */}
        <div className="role-selector-pill">
          {['buyer', 'seller', 'arbitrator'].map((role) => (
            <button
              key={role}
              onClick={() => onSwitchRole(role)}
              style={{
                background: wallet?.role?.toLowerCase().includes(role)
                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))'
                  : 'transparent',
                color: wallet?.role?.toLowerCase().includes(role) ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Wallet Status Badge */}
        <div className="wallet-status-badge">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{wallet?.shortAddress}</span>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {formatAmount(wallet?.balance || 0)} XLM
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#c084fc',
              flexShrink: 0,
            }}
          >
            <Wallet size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
