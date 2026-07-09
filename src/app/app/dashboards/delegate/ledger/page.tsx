import React from 'react';
import Link from 'next/link';

export default function LedgerPage() {
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <Link href="/dashboards/delegate" style={{ color: '#22d3ee', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Command Center</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Financial Ledger & Payouts</h1>
      <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Manage prize money distributions, sponsor payouts, and refund processing.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#1e1e24', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Prize Pool</h3>
          <h2 style={{ color: '#10b981', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>$50,000</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Payout triggers locked until final match completion.</p>
        </div>

        <div style={{ background: '#1e1e24', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Refund Queue</h3>
          <h2 style={{ color: '#ef4444', fontSize: '2.5rem', margin: '0 0 1rem 0' }}>$0</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No pending weather or cancellation refunds.</p>
        </div>
      </div>
    </div>
  );
}
