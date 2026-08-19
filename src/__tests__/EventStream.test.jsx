import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventLogStream from '../components/EventLogStream';

describe('Event Log Stream Component', () => {
  it('renders live connection badge and logs', () => {
    const events = [
      {
        timestamp: '10:00:00 AM',
        type: 'CONTRACT_DEPLOY',
        message: 'Soroban smart contract deployed',
        color: '#34d399',
      },
    ];

    render(<EventLogStream events={events} />);

    expect(screen.getByText('LIVE CONNECTION')).toBeInTheDocument();
    expect(screen.getByText('CONTRACT_DEPLOY:')).toBeInTheDocument();
    expect(screen.getByText('Soroban smart contract deployed')).toBeInTheDocument();
  });
});
