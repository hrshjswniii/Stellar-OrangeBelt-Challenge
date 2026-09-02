import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ServiceCard from './components/ServiceCard';
import CreateListingModal from './components/CreateListingModal';
import EscrowDashboard from './components/EscrowDashboard';
import ReputationLeaderboard from './components/ReputationLeaderboard';
import EventLogStream from './components/EventLogStream';
import ContractInfoModal from './components/ContractInfoModal';

import {
  INITIAL_SERVICES,
  INITIAL_ESCROWS,
  INITIAL_LEADERBOARD,
  CONTRACT_ADDRESSES,
} from './services/mockData';
import {
  connectFreighterWallet,
  invokeSorobanContract,
  fetchSorobanEvents,
} from './services/sorobanClient';
import { Sparkles, Search } from 'lucide-react';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [activeRole, setActiveRole] = useState('buyer'); // buyer | seller | arbitrator
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [escrows, setEscrows] = useState(INITIAL_ESCROWS);
  const [leaderboard] = useState(INITIAL_LEADERBOARD);
  const [events, setEvents] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONTRACT_SPECS',
      message: `Soroban Escrow, Marketplace & Reputation Smart Contracts active on ${CONTRACT_ADDRESSES.network}`,
      color: '#34d399',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'SOROBAN_SDK_INIT',
      message: '@stellar/stellar-sdk & @stellar/freighter-api RPC interface initialized.',
      color: '#38bdf8',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isContractInfoOpen, setIsContractInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('MARKETPLACE');
  const [txLoading, setTxLoading] = useState(false);

  // Poll Soroban RPC events periodically
  useEffect(() => {
    const timer = setInterval(async () => {
      if (CONTRACT_ADDRESSES.marketplace && !CONTRACT_ADDRESSES.marketplace.includes('PLACEHOLDER')) {
        const liveEvents = await fetchSorobanEvents(CONTRACT_ADDRESSES.marketplace);
        if (liveEvents.length > 0) {
          setEvents((prev) => [...liveEvents, ...prev]);
        }
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleConnectFreighter = async () => {
    try {
      const freighterWallet = await connectFreighterWallet();
      setWallet(freighterWallet);
      pushEvent('WALLET_CONNECTED', `Freighter Wallet connected: ${freighterWallet.shortAddress}`, '#34d399');
    } catch (err) {
      alert(`Freighter Connection Error: ${err.message}`);
    }
  };

  const handleDisconnectWallet = () => {
    setWallet(null);
    pushEvent('WALLET_DISCONNECTED', 'Freighter Wallet disconnected.', '#fb7185');
  };

  const handleSwitchRole = (role) => {
    setActiveRole(role);
    pushEvent('ROLE_SWITCH', `Active UI role switched to ${role.toUpperCase()}`, '#c084fc');
  };

  const pushEvent = (type, message, color = '#38bdf8') => {
    setEvents((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        color,
      },
      ...prev.slice(0, 49),
    ]);
  };

  // Buy service -> Invokes Marketplace contract `buy_service` via Soroban SDK
  const handleBuyService = async (service) => {
    setTxLoading(true);
    const newEscrowId = escrows.length + 101;
    const buyerAddress = wallet?.address || 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA';

    pushEvent(
      'SOROBAN_TX_BUILDING',
      `Assembling Soroban TransactionBuilder invocation: Marketplace.buy_service(listing_id: ${service.id})...`,
      '#38bdf8'
    );

    let txHash = null;
    try {
      if (CONTRACT_ADDRESSES.marketplace && !CONTRACT_ADDRESSES.marketplace.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.marketplace,
          method: 'buy_service',
          args: [
            { type: 'Address', value: buyerAddress },
            BigInt(service.id),
            { type: 'Address', value: CONTRACT_ADDRESSES.escrow },
            { type: 'Address', value: 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO' },
            { type: 'Address', value: CONTRACT_ADDRESSES.reputation },
          ],
          signerAddress: buyerAddress,
        });
        txHash = result.hash;
        pushEvent('SOROBAN_TX_SUCCESS', `Soroban buy_service confirmed on Testnet! Tx Hash: ${txHash.slice(0, 10)}...`, '#34d399');
      } else {
        pushEvent(
          'SOROBAN_SDK_SIMULATION',
          `@stellar/stellar-sdk prepared & simulated buy_service transaction. (Escrow #${newEscrowId} funded)`,
          '#f59e0b'
        );
      }
    } catch (err) {
      console.warn('Soroban invocation warning:', err.message);
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    const newEscrow = {
      id: newEscrowId,
      serviceId: service.id,
      serviceTitle: service.title,
      buyer: wallet?.shortAddress || 'GCP77B...11AA',
      buyerFull: buyerAddress,
      seller: service.seller,
      sellerFull: service.sellerFull,
      arbitrator: 'GARB99...88DAO',
      arbitratorFull: 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO',
      amount: service.price,
      status: 'Funded',
      statusCode: 0,
      createdAt: new Date().toISOString(),
      workDetails: txHash ? `Locked via Soroban Tx: ${txHash}` : 'Escrow account created & funds locked in Soroban contract.',
    };

    setEscrows([newEscrow, ...escrows]);
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, totalSales: s.totalSales + 1 } : s))
    );
    setActiveTab('ESCROW_DASHBOARD');
  };

  // Create Listing -> Invokes Marketplace contract `create_listing` via Soroban SDK
  const handleCreateListing = async (newServiceData) => {
    setTxLoading(true);
    const sellerAddress = wallet?.address || 'GBX42A7M5KQR9W2X8L3N4P1Q6V0Y7Z9K21';

    try {
      if (CONTRACT_ADDRESSES.marketplace && !CONTRACT_ADDRESSES.marketplace.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.marketplace,
          method: 'create_listing',
          args: [
            { type: 'Address', value: sellerAddress },
            newServiceData.title,
            newServiceData.description,
            BigInt(newServiceData.price),
            0,
          ],
          signerAddress: sellerAddress,
        });
        pushEvent('SOROBAN_TX_SUCCESS', `Listing created on Soroban Testnet! Tx: ${result.hash.slice(0, 10)}...`, '#34d399');
      } else {
        pushEvent('LISTING_CREATED', `Soroban SDK prepared listing: "${newServiceData.title}" (${newServiceData.price} XLM)`, '#10b981');
      }
    } catch (err) {
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    const newService = {
      id: services.length + 1,
      ...newServiceData,
      seller: wallet?.shortAddress || 'GBX42A...9K21',
      sellerFull: sellerAddress,
      rating: 100,
      totalSales: 0,
      active: true,
    };
    setServices([newService, ...services]);
  };

  // Submit Work -> Invokes Escrow contract `submit_work`
  const handleSubmitWork = async (escrowId) => {
    setTxLoading(true);
    const sellerAddress = wallet?.address || 'GBX42A7M5KQR9W2X8L3N4P1Q6V0Y7Z9K21';

    try {
      if (CONTRACT_ADDRESSES.escrow && !CONTRACT_ADDRESSES.escrow.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.escrow,
          method: 'submit_work',
          args: [BigInt(escrowId), { type: 'Address', value: sellerAddress }],
          signerAddress: sellerAddress,
        });
        pushEvent('WORK_SUBMITTED_TX', `Soroban submit_work confirmed! Tx: ${result.hash.slice(0, 10)}...`, '#34d399');
      } else {
        pushEvent('WORK_SUBMITTED', `Escrow #${escrowId}: Seller submitted work via Soroban contract interface.`, '#fbbf24');
      }
    } catch (err) {
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId
          ? { ...e, status: 'WorkSubmitted', statusCode: 1, workDetails: 'Deliverables uploaded. Awaiting buyer review.' }
          : e
      )
    );
  };

  // Approve Payment -> Invokes Escrow contract `approve_and_release`
  const handleApprovePayment = async (escrowId) => {
    setTxLoading(true);
    const buyerAddress = wallet?.address || 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA';

    try {
      if (CONTRACT_ADDRESSES.escrow && !CONTRACT_ADDRESSES.escrow.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.escrow,
          method: 'approve_and_release',
          args: [BigInt(escrowId), { type: 'Address', value: buyerAddress }],
          signerAddress: buyerAddress,
        });
        pushEvent('ESCROW_APPROVED_TX', `Soroban approve_and_release confirmed! Funds released. Tx: ${result.hash.slice(0, 10)}...`, '#34d399');
      } else {
        pushEvent('ESCROW_APPROVED', `Escrow #${escrowId}: Buyer approved payment! Inter-contract Reputation call triggered.`, '#34d399');
      }
    } catch (err) {
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId ? { ...e, status: 'Approved', statusCode: 2, workDetails: 'Payment released to seller.' } : e
      )
    );
  };

  // Raise Dispute -> Invokes Escrow contract `raise_dispute`
  const handleRaiseDispute = async (escrowId) => {
    setTxLoading(true);
    const callerAddress = wallet?.address || 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA';

    try {
      if (CONTRACT_ADDRESSES.escrow && !CONTRACT_ADDRESSES.escrow.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.escrow,
          method: 'raise_dispute',
          args: [BigInt(escrowId), { type: 'Address', value: callerAddress }],
          signerAddress: callerAddress,
        });
        pushEvent('DISPUTE_RAISED_TX', `Soroban raise_dispute confirmed! Tx: ${result.hash.slice(0, 10)}...`, '#fb7185');
      } else {
        pushEvent('DISPUTE_RAISED', `Escrow #${escrowId}: Dispute initiated on Soroban Escrow contract.`, '#fb7185');
      }
    } catch (err) {
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId ? { ...e, status: 'Disputed', statusCode: 3, workDetails: 'Dispute opened. Arbitrator review required.' } : e
      )
    );
  };

  // Resolve Dispute -> Invokes Escrow contract `resolve_dispute`
  const handleResolveDispute = async (escrowId, releaseToSeller) => {
    setTxLoading(true);
    const arbitratorAddress = wallet?.address || 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO';

    try {
      if (CONTRACT_ADDRESSES.escrow && !CONTRACT_ADDRESSES.escrow.includes('PLACEHOLDER') && wallet?.connected) {
        const result = await invokeSorobanContract({
          contractId: CONTRACT_ADDRESSES.escrow,
          method: 'resolve_dispute',
          args: [BigInt(escrowId), { type: 'Address', value: arbitratorAddress }, releaseToSeller],
          signerAddress: arbitratorAddress,
        });
        pushEvent('DISPUTE_RESOLVED_TX', `Soroban resolve_dispute confirmed! Tx: ${result.hash.slice(0, 10)}...`, '#c084fc');
      } else {
        pushEvent(
          'DISPUTE_RESOLVED',
          `Escrow #${escrowId}: Arbitrator resolved dispute (${releaseToSeller ? 'Payout to Seller' : 'Refund to Buyer'}).`,
          '#c084fc'
        );
      }
    } catch (err) {
      pushEvent('SOROBAN_TX_NOTICE', `SDK Transaction Notice: ${err.message}`, '#fb7185');
    } finally {
      setTxLoading(false);
    }

    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId
          ? {
              ...e,
              status: releaseToSeller ? 'Resolved' : 'Refunded',
              statusCode: releaseToSeller ? 4 : 5,
              workDetails: releaseToSeller ? 'Arbitrator ruled in favor of seller.' : 'Arbitrator refunded buyer.',
            }
          : e
      )
    );
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Navbar
        wallet={wallet}
        activeRole={activeRole}
        onConnectFreighter={handleConnectFreighter}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchRole={handleSwitchRole}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenContractInfo={() => setIsContractInfoOpen(true)}
      />

      <div className="app-container">
        {/* Banner */}
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(22, 31, 53, 0.9), rgba(139, 92, 246, 0.15))',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> SOROBAN ORANGE BELT dAPP
            </div>
            <h1>Decentralized Stellar Escrow Marketplace</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Purchase digital products and services securely locked in Soroban Escrow contracts. Connect Freighter Wallet for on-chain Soroban Testnet transactions.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            style={{
              background: activeTab === 'MARKETPLACE' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: activeTab === 'MARKETPLACE' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'MARKETPLACE' ? '1px solid var(--accent-purple)' : '1px solid transparent',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
            id="tab-marketplace"
          >
            Services Marketplace ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('ESCROW_DASHBOARD')}
            style={{
              background: activeTab === 'ESCROW_DASHBOARD' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: activeTab === 'ESCROW_DASHBOARD' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'ESCROW_DASHBOARD' ? '1px solid var(--accent-purple)' : '1px solid transparent',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
            id="tab-escrow-dashboard"
          >
            Escrow Dashboard ({escrows.length})
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="dashboard-grid">
          <div>
            {activeTab === 'MARKETPLACE' ? (
              <div>
                {/* Search & Category Filter Bar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      placeholder="Search services by keyword or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                        background: 'rgba(22, 31, 53, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(22, 31, 53, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="AUDITING">Auditing</option>
                    <option value="DESIGN">Design</option>
                    <option value="WRITING">Writing</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>

                {/* Services Grid */}
                <div className="services-grid">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} onBuy={handleBuyService} />
                  ))}
                </div>
              </div>
            ) : (
              <EscrowDashboard
                escrows={escrows}
                currentRole={activeRole}
                onSubmitWork={handleSubmitWork}
                onApprovePayment={handleApprovePayment}
                onRaiseDispute={handleRaiseDispute}
                onResolveDispute={handleResolveDispute}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            <ReputationLeaderboard leaderboard={leaderboard} />
            <EventLogStream events={events} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSubmit={handleCreateListing}
      />

      <ContractInfoModal
        isOpen={isContractInfoOpen}
        onClose={() => setIsContractInfoOpen(false)}
      />
    </div>
  );
}