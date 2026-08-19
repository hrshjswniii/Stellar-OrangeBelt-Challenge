import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceCard from '../components/ServiceCard';
import { INITIAL_SERVICES } from '../services/mockData';

describe('Marketplace Components', () => {
  it('renders service details correctly', () => {
    const service = INITIAL_SERVICES[0];
    const handleBuy = vi.fn();

    render(<ServiceCard service={service} onBuy={handleBuy} />);

    expect(screen.getByText(service.title)).toBeInTheDocument();
    expect(screen.getByText(service.description)).toBeInTheDocument();
    expect(screen.getByText('Auditing')).toBeInTheDocument();
  });

  it('triggers buy action when Buy with Escrow button is clicked', () => {
    const service = INITIAL_SERVICES[0];
    const handleBuy = vi.fn();

    render(<ServiceCard service={service} onBuy={handleBuy} />);

    const buyBtn = screen.getByRole('button', { name: /buy with escrow/i });
    fireEvent.click(buyBtn);

    expect(handleBuy).toHaveBeenCalledWith(service);
  });
});
