import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

export default function CreateListingModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Development');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill out all required fields.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid positive price amount.');
      return;
    }

    onSubmit({
      title,
      description,
      price: numPrice,
      category,
    });

    setTitle('');
    setDescription('');
    setPrice('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle className="text-gradient" size={22} />
            <span>List Service on Soroban Marketplace</span>
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Service Title
            </label>
            <input
              type="text"
              placeholder="e.g. Soroban Smart Contract Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'inherit',
              }}
            >
              <option value="Development">Development</option>
              <option value="Auditing">Auditing</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Escrow Price (XLM)
            </label>
            <input
              type="number"
              placeholder="1000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Service Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe deliverables, timelines, and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="submit-listing-btn">
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
