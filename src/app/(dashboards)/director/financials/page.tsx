import React from 'react';
import { FinancialLedger } from '@/components/director/FinancialLedger';
import { MassRefundTrigger } from '@/components/director/MassRefundTrigger';
import { SponsorVisibilityTracker } from '@/components/director/SponsorVisibilityTracker';

export default function FinancialsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#f59e0b' }}>FINANCIALS</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af' }}>Prize pool management, refunds, and sponsor reconciliation.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Main Ledger */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FinancialLedger />
        </div>

        {/* Edge Cases */}
        <SponsorVisibilityTracker />
        <MassRefundTrigger />
      </div>
    </div>
  );
}
