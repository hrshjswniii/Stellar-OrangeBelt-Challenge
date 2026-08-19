import { CONTRACT_ADDRESSES } from './mockData';

export const MOCK_WALLETS = {
  buyer: {
    address: 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA',
    short: 'GCP77B...11AA',
    role: 'Buyer',
    balance: 12500,
  },
  seller: {
    address: 'GBX42A7M5KQR9W2X8L3N4P1Q6V0Y7Z9K21',
    short: 'GBX42A...9K21',
    role: 'Seller',
    balance: 8400,
  },
  arbitrator: {
    address: 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO',
    short: 'GARB99...88DAO',
    role: 'Arbitrator DAO',
    balance: 50000,
  },
};

export const checkFreighterInstalled = () => {
  return typeof window !== 'undefined' && window.freighter;
};

export const connectWallet = async (preferredRole = 'buyer') => {
  if (checkFreighterInstalled()) {
    try {
      const isConnected = await window.freighter.isConnected();
      if (isConnected) {
        const address = await window.freighter.getPublicKey();
        return {
          connected: true,
          address,
          shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
          balance: 10000,
          isMock: false,
          role: preferredRole,
        };
      }
    } catch (err) {
      console.warn('Freighter wallet connection failed, falling back to interactive demo mode:', err);
    }
  }

  // Interactive Mock Mode for seamless testing and demonstration
  const mock = MOCK_WALLETS[preferredRole] || MOCK_WALLETS.buyer;
  return {
    connected: true,
    address: mock.address,
    shortAddress: mock.short,
    balance: mock.balance,
    isMock: true,
    role: mock.role,
  };
};

export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
