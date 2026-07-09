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
      <div >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle size={80} color="var(--success)"  />
        </motion.div>
        <h1 >Payment Successful!</h1>
        <p >
          Your team is now officially registered for the tournament.
        </p>
        <DynamicButton variant="secondary" onClick={() => window.location.href = '/sandbox/registration'}>
          Return to Portal
        </DynamicButton>
      </div>
    );
  }

  return (
    <div >
      
      <div >
        <h1 >
          Rainmaker Gateway
        </h1>
        <p >
          Secure Checkout for Tournament Registration
        </p>
      </div>

      {error && (
        <div >
          {error}
        </div>
      )}

      {canceled && (
        <div >
          Checkout was canceled. You have not been charged.
        </div>
      )}

      {!sandboxState && loading ? (
        <p >Initializing Gateway...</p>
      ) : sandboxState ? (
        <Card >
          
          <div >
            <div>
              <div >
                Event Registration
              </div>
              <h2 >Rainmaker Open 2026</h2>
            </div>
            <div >
              <div >$50<span >.00</span></div>
              <div >Entry Fee</div>
            </div>
          </div>

          <div >
            <div >
              <span >Team ID:</span>
              <span >{sandboxState.pendingTeamId}</span>
            </div>
            <div >
              <span >Status:</span>
              <span >PENDING PAYMENT</span>
            </div>
            <div >
              <span >Platform Fee (10%):</span>
              <span>$5.00</span>
            </div>
          </div>

          <DynamicButton 
            variant="secondary" 
            onClick={handleCheckout}
            disabled={checkoutLoading}
            
          >
            {checkoutLoading ? 'Initiating...' : (
              <>
                <CreditCard size={24} />
                Register Team & Pay
              </>
            )}
          </DynamicButton>

          <div >
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
    <Suspense fallback={<div >Loading Portal...</div>}>
      <RegistrationContent />
    </Suspense>
  );
}
