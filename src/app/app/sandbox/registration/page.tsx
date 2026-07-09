'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Card } from '@/components/ui/Card';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function RegistrationContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const [sandboxState, setSandboxState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSandbox = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sandbox/treasury');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSandboxState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!success && !canceled) {
      loadSandbox();
    }
  }, [success, canceled]);

  const handleCheckout = async () => {
    if (!sandboxState) return;
    try {
      setCheckoutLoading(true);
      const res = await fetch(`/api/tournaments/${sandboxState.tournamentId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: sandboxState.pendingTeamId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to Stripe (or our Mock Checkout Sandbox)
      window.location.href = data.url;

    } catch (err: any) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '24px' }} />
        </motion.div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 16px 0' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '32px' }}>
          Your team is now officially registered for the tournament.
        </p>
        <DynamicButton variant="outline" onClick={() => window.location.href = '/sandbox/registration'}>
          Return to Portal
        </DynamicButton>
      </div>
    );
  }

  return (
    <div style={{ padding: '64px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 16px 0' }}>
          Rainmaker Gateway
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Secure Checkout for Tournament Registration
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(248,81,73,0.2)' }}>
          {error}
        </div>
      )}

      {canceled && (
        <div style={{ background: 'rgba(210,153,34,0.1)', color: '#d29922', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(210,153,34,0.2)' }}>
          Checkout was canceled. You have not been charged.
        </div>
      )}

      {!sandboxState && loading ? (
        <p style={{ textAlign: 'center' }}>Initializing Gateway...</p>
      ) : sandboxState ? (
        <Card style={{ padding: '48px', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(145deg, #161b22, #0d1117)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Event Registration
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Rainmaker Open 2026</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>$50<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>.00</span></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Entry Fee</div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Team ID:</span>
              <span style={{ fontFamily: 'monospace' }}>{sandboxState.pendingTeamId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: '#d29922', fontWeight: 600 }}>PENDING PAYMENT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Fee (10%):</span>
              <span>$5.00</span>
            </div>
          </div>

          <DynamicButton 
            variant="primary" 
            onClick={handleCheckout}
            disabled={checkoutLoading}
            style={{ width: '100%', padding: '20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', gap: '12px' }}
          >
            {checkoutLoading ? 'Initiating...' : (
              <>
                <CreditCard size={24} />
                Register Team & Pay
              </>
            )}
          </DynamicButton>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            Payments secured by Stripe
          </div>

        </Card>
      ) : null}

    </div>
  );
}

export default function RegistrationPortal() {
  return (
    <Suspense fallback={<div style={{ padding: '64px', textAlign: 'center' }}>Loading Portal...</div>}>
      <RegistrationContent />
    </Suspense>
  );
}
