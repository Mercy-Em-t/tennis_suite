'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ManagerDashboardClientProps {
  metrics: {
    totalUsers: number;
    byRole: {
      players: number;
      hosts: number;
      referees: number;
      marshalls: number;
      broadcasters: number;
    }
  };
  tournaments: any[];
  financials: {
    platformRevenue: number;
    owedToPartners: number;
    grossVolume: number;
    hostPayouts: number;
  };
}

type TabKey = 'overview' | 'tournaments' | 'financials' | 'licensing';

export default function ManagerDashboardClient({ metrics, tournaments, financials }: ManagerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs = [
    { id: 'overview', label: '📊 Global Overview' },
    { id: 'tournaments', label: '🏟️ Tournament Network' },
    { id: 'financials', label: '💰 Financial & Treasury' },
    { id: 'licensing', label: '📜 Licensing' }
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh', background: '#050814' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          Platform Manager <Badge variant="accent">SUPER-ADMIN</Badge>
        </h1>
        <p style={{ color: '#8b949e', marginTop: '8px', margin: 0 }}>
          Global control center for ecosystem health, financials, and licensing.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabKey)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              color: activeTab === tab.id ? '#00f0ff' : '#8b949e',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'rgba(0, 240, 255, 0.3)' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ position: 'relative', flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
            {activeTab === 'tournaments' && <TournamentsTab tournaments={tournaments} />}
            {activeTab === 'financials' && <FinancialsTab financials={financials} />}
            {activeTab === 'licensing' && <LicensingTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewTab({ metrics }: { metrics: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Total Registered Users</h3>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{metrics.totalUsers}</div>
      </Card>

      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '16px' }}>User Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c9d1d9' }}><span>Players</span> <strong>{metrics.byRole.players}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c9d1d9' }}><span>Hosts</span> <strong>{metrics.byRole.hosts}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c9d1d9' }}><span>Referees & Marshalls</span> <strong>{metrics.byRole.referees + metrics.byRole.marshalls}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c9d1d9' }}><span>Broadcasters</span> <strong>{metrics.byRole.broadcasters}</strong></div>
        </div>
      </Card>

      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Platform Health</h3>
        <div style={{ color: '#3fb950', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 600 }}>
          <span style={{ fontSize: '1.5rem' }}>●</span> All Systems Operational
        </div>
        <p style={{ color: '#8b949e', marginTop: '16px', fontSize: '0.9rem' }}>User churn is currently at 1.2% (MoM).</p>
      </Card>
    </div>
  );
}

function TournamentsTab({ tournaments }: { tournaments: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {tournaments.length === 0 ? (
        <div style={{ color: '#8b949e' }}>No tournaments found in the network.</div>
      ) : (
        tournaments.map((t) => (
          <Card key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{t.name}</h3>
                {t.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
                <Badge variant="accent">{t.lifecyclePhase}</Badge>
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.9rem', display: 'flex', gap: '16px' }}>
                <span>Host: {t.host?.name || 'Unknown'}</span>
                <span>Teams: {t._count?.teams || 0}</span>
                <span>Matches: {t._count?.matches || 0}</span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => window.open(`/tournaments/${t.slug || t.id}`, '_blank')}>
              Preview Profile ↗
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}

function FinancialsTab({ financials }: { financials: any }) {
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Gross Processed Volume</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{formatMoney(financials.grossVolume)}</div>
        <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '8px' }}>Total money moved through the platform.</p>
      </Card>

      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Net Platform Revenue</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3fb950' }}>{formatMoney(financials.platformRevenue)}</div>
        <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '8px' }}>Rainmaker fees collected.</p>
      </Card>

      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)', gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#8b949e', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Host Payouts</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{formatMoney(financials.hostPayouts)}</div>
          </div>
          <Button variant="primary">Disburse Funds</Button>
        </div>
      </Card>
    </div>
  );
}

function LicensingTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <Card style={{ background: 'rgba(13, 17, 23, 0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Standard Host License</h3>
          <Badge variant="success">Active (142)</Badge>
        </div>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '24px' }}>
          Default tier for local tournament organizers. Includes standard matchmaking and 5% platform fee.
        </p>
        <Button variant="secondary" style={{ width: '100%' }}>Manage Tier</Button>
      </Card>

      <Card style={{ background: 'linear-gradient(145deg, rgba(13, 17, 23, 0.8), rgba(0, 240, 255, 0.05))', borderColor: 'rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#00f0ff', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Enterprise Club License <span>✨</span>
          </h3>
          <Badge variant="accent">Active (12)</Badge>
        </div>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '24px' }}>
          White-labeled multi-tenant subdomains for large country clubs. Flat $499/mo + 2% platform fee.
        </p>
        <Button variant="primary" style={{ width: '100%', background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.5)' }}>Review Pending Applications (3)</Button>
      </Card>
    </div>
  );
}
