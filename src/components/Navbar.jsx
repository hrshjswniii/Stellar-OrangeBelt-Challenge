import React from 'react';
import { ShieldCheck, Wallet, PlusCircle, FileCode, Zap, LogOut } from 'lucide-react';
import { formatAmount } from '../services/sorobanClient';

export default function Navbar({
  wallet,
  onConnectFreighter,
  onDisconnectWallet,
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

        {/* Connect / Disconnect Wallet Button */}
        {!wallet?.isMock ? (
          <button
            className="btn btn-secondary"
            onClick={onDisconnectWallet}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              borderColor: 'rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
            }}
            title="Disconnect active Freighter wallet"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onConnectFreighter}
            title="Connect browser Freighter wallet for real Soroban transaction signing"
          >
            <Zap size={16} />
            <span>Connect Freighter</span>
          </button>
        )}

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
              background: !wallet?.isMock ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              color: !wallet?.isMock ? '#34d399' : '#c084fc',
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