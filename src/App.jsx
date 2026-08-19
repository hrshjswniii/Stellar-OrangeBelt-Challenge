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
import { connectWallet } from './services/sorobanClient';
import { Shield, Sparkles, Filter, Search, CheckCircle } from 'lucide-react';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [escrows, setEscrows] = useState(INITIAL_ESCROWS);
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
  const [events, setEvents] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONTRACT_DEPLOY',
      message: `Escrow & Marketplace smart contracts deployed on ${CONTRACT_ADDRESSES.network}`,
      color: '#34d399',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      type: 'EVENT_STREAM_INIT',
      message: 'Soroban inter-contract event listener active.',
      color: '#38bdf8',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isContractInfoOpen, setIsContractInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('MARKETPLACE'); // MARKETPLACE | ESCROW_DASHBOARD

  // Initialize default wallet on load
  useEffect(() => {
    connectWallet('buyer').then(setWallet);
  }, []);

  const handleSwitchRole = async (role) => {
    const w = await connectWallet(role);
    setWallet(w);
    pushEvent('ROLE_SWITCH', `Active wallet switched to ${role.toUpperCase()} (${w.shortAddress})`, '#c084fc');
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

  // Buy service -> creates new Escrow via Inter-Contract call
  const handleBuyService = (service) => {
    const newEscrowId = escrows.length + 101;
    const newEscrow = {
      id: newEscrowId,
      serviceId: service.id,
      serviceTitle: service.title,
      buyer: wallet?.shortAddress || 'GCP77B...11AA',
      buyerFull: wallet?.address || 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA',
      seller: service.seller,
      sellerFull: service.sellerFull,
      arbitrator: 'GARB99...88DAO',
      arbitratorFull: 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO',
      amount: service.price,
      status: 'Funded',
      statusCode: 0,
      createdAt: new Date().toISOString(),
      workDetails: 'Escrow account created & funds locked in Soroban contract.',
    };

    setEscrows([newEscrow, ...escrows]);
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, totalSales: s.totalSales + 1 } : s))
    );

    pushEvent(
      'INTER_CONTRACT_CALL',
      `Marketplace Contract -> Escrow Contract. Created Escrow #${newEscrowId} for ${service.price} XLM`,
      '#f59e0b'
    );
    setActiveTab('ESCROW_DASHBOARD');
  };

  // Create Listing
  const handleCreateListing = (newServiceData) => {
    const newService = {
      id: services.length + 1,
      ...newServiceData,
      seller: wallet?.shortAddress || 'GBX42A...9K21',
      sellerFull: wallet?.address || 'GBX42A7M5KQR9W2X8L3N4P1Q6V0Y7Z9K21',
      rating: 100,
      totalSales: 0,
      active: true,
    };
    setServices([newService, ...services]);
    pushEvent('LISTING_CREATED', `New listing #${newService.id} published: "${newService.title}"`, '#10b981');
  };

  // Escrow actions
  const handleSubmitWork = (escrowId) => {
    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId
          ? { ...e, status: 'WorkSubmitted', statusCode: 1, workDetails: 'Deliverables uploaded. Awaiting buyer review.' }
          : e
      )
    );
    pushEvent('WORK_SUBMITTED', `Escrow #${escrowId}: Seller submitted work for review.`, '#fbbf24');
  };

  const handleApprovePayment = (escrowId) => {
    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId ? { ...e, status: 'Approved', statusCode: 2, workDetails: 'Payment released to seller.' } : e
      )
    );
    pushEvent('ESCROW_APPROVED', `Escrow #${escrowId}: Buyer approved payment! Funds released to seller & Reputation updated.`, '#34d399');
  };

  const handleRaiseDispute = (escrowId) => {
    setEscrows((prev) =>
      prev.map((e) =>
        e.id === escrowId ? { ...e, status: 'Disputed', statusCode: 3, workDetails: 'Dispute opened. Arbitrator review required.' } : e
      )
    );
    pushEvent('DISPUTE_RAISED', `Escrow #${escrowId}: Dispute initiated. Funds locked for arbitration.`, '#fb7185');
  };

  const handleResolveDispute = (escrowId, releaseToSeller) => {
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
    pushEvent(
      'DISPUTE_RESOLVED',
      `Escrow #${escrowId}: Arbitrator resolved dispute (${releaseToSeller ? 'Payout to Seller' : 'Refund to Buyer'}).`,
      '#c084fc'
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
              Purchase digital products and services securely locked in Soroban Escrow contracts. Payments are automatically released upon approval or arbitrated seamlessly.
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
                currentRole={wallet?.role || 'buyer'}
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
