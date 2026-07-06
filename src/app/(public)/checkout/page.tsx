'use client';

import React, { useState, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('t');
  const franchiseName = searchParams.get('f');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, franchiseName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      
      // Success, route to Walled Garden
      window.location.href = '/team';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  if (!tournamentId || !franchiseName) {
    return <div style={{ color: '#f85149' }}>Invalid Checkout Session. Missing parameters.</div>;
  }

  return (
    <Card style={{ padding: '2rem', width: '450px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#1f6feb', color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
          $
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Tournament Entry Fee</h1>
        <p style={{ color: '#8b949e', marginTop: '8px' }}>Secure your spot for <strong>{franchiseName}</strong></p>
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#8b949e' }}>Entry Fee</span>
          <span style={{ fontWeight: 600 }}>$150.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#8b949e' }}>Platform Fee</span>
          <span style={{ fontWeight: 600 }}>$7.50</span>
        </div>
        <div style={{ borderTop: '1px solid #30363d', margin: '12px 0' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Due</span>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#7ee787' }}>$157.50</span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
          {error}
        </div>
      )}

      <Button onClick={handlePay} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with Mock Stripe'}
      </Button>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: '#8b949e' }}>
        This is a simulated Stripe Sandbox environment.
      </p>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#f0f6fc', fontFamily: 'Inter, sans-serif' }}>
      <Suspense fallback={<div>Loading Secure Checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
