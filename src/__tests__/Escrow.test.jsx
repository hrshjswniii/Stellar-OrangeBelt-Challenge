import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EscrowCard from '../components/EscrowCard';
import { INITIAL_ESCROWS } from '../services/mockData';

describe('Escrow Dashboard Components', () => {
  it('renders escrow card with correct status badge', () => {
    const escrow = INITIAL_ESCROWS[0]; // WorkSubmitted
    render(
      <EscrowCard
        escrow={escrow}
        currentRole="buyer"
        onSubmitWork={vi.fn()}
        onApprovePayment={vi.fn()}
        onRaiseDispute={vi.fn()}
        onResolveDispute={vi.fn()}
      />
    );

    expect(screen.getByText(`ESCROW #${escrow.id}`)).toBeInTheDocument();
    expect(screen.getByText('Work Submitted')).toBeInTheDocument();
  });

  it('allows buyer to approve payment and release funds', () => {
    const escrow = INITIAL_ESCROWS[0];
    const handleApprove = vi.fn();

    render(
      <EscrowCard
        escrow={escrow}
        currentRole="buyer"
        onSubmitWork={vi.fn()}
        onApprovePayment={handleApprove}
        onRaiseDispute={vi.fn()}
        onResolveDispute={vi.fn()}
      />
    );

    const approveBtn = screen.getByRole('button', { name: /approve & release funds/i });
    fireEvent.click(approveBtn);

    expect(handleApprove).toHaveBeenCalledWith(escrow.id);
  });
});
