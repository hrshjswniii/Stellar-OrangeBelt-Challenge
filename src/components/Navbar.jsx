import React from 'react';
import { ShieldCheck, Wallet, PlusCircle, FileCode, Zap, LogOut } from 'lucide-react';
import { formatAmount } from '../services/sorobanClient';

export default function Navbar({
  wallet,
  activeRole,
  onConnectFreighter,
  onDisconnectWallet,
  onSwitchRole,
  onOpenCreateListing,
  onOpenContractInfo,
}) {
  const isFreighterConnected = wallet && wallet.connected && !wallet.isMock;

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
        {isFreighterConnected ? (
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
                background: activeRole === role
                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))'
                  : 'transparent',
                color: activeRole === role ? '#fff' : 'var(--text-muted)',
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
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
              {isFreighterConnected ? wallet.shortAddress : 'Not Connected'}
            </span>
            <span style={{ fontSize: '0.7rem', color: isFreighterConnected ? '#38bdf8' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {isFreighterConnected ? `${formatAmount(wallet?.balance || 10000)} XLM` : '-- XLM'}
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
              background: isFreighterConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: isFreighterConnected ? '#34d399' : 'var(--text-dim)',
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