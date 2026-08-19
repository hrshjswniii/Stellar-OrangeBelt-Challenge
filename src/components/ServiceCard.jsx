import React from 'react';
import { ShieldCheck, ShoppingCart, Star, Tag, CheckCircle2 } from 'lucide-react';
import { formatAmount } from '../services/sorobanClient';

export default function ServiceCard({ service, onBuy }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(6, 182, 212, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
          }}
        >
          <Tag size={12} />
          {service.category}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
          }}
        >
          <Star size={13} fill="#f59e0b" />
          <span>{service.rating}% Score</span>
        </div>
      </div>

      <h3 style={{ marginBottom: '0.5rem', color: '#f8fafc', fontSize: '1.1rem' }}>{service.title}</h3>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flexGrow: 1, lineHeight: '1.5' }}>
        {service.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
        <ShieldCheck size={14} className="text-muted" />
        <span>Seller: <strong style={{ color: 'var(--text-muted)' }}>{service.seller}</strong></span>
        <span>•</span>
        <CheckCircle2 size={14} style={{ color: '#10b981' }} />
        <span>{service.totalSales} Completed Sales</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Escrow Price</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {formatAmount(service.price)} <span style={{ fontSize: '0.85rem' }}>XLM</span>
          </span>
        </div>

        <button className="btn btn-primary" onClick={() => onBuy(service)} id={`buy-btn-${service.id}`}>
          <ShoppingCart size={16} />
          <span>Buy with Escrow</span>
        </button>
      </div>
    </div>
  );
}
