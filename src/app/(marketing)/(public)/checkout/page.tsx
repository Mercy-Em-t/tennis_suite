'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { DynamicButton } from '@/components/ui/DynamicButton';
import styles from '../../landing.module.css';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tournamentId = searchParams.get('t');
  const franchiseName = searchParams.get('f');
  const categoriesParam = searchParams.get('c');
  const emailParam = searchParams.get('e');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId || !franchiseName) {
      router.push('/');
    }
    if (categoriesParam) {
      try {
        setCategories(JSON.parse(categoriesParam));
      } catch (e) {
        console.error("Failed to parse categories");
      }
    }
  }, [tournamentId, franchiseName, categoriesParam, router]);

  // Polling logic when checkoutRequestId is present
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutRequestId && !isSuccess) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
          const data = await res.json();
          if (data.status === 'COMPLETED') {
            setIsSuccess(true);
            setCheckoutRequestId(null);
            clearInterval(interval);
            setTimeout(() => {
              router.push(`/tournaments/${tournamentId}`);
            }, 3000);
          } else if (data.status === 'FAILED') {
            setError('Payment failed or was cancelled.');
            setIsProcessing(false);
            setCheckoutRequestId(null);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error polling status", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [checkoutRequestId, isSuccess, router, tournamentId]);

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError('Please enter your M-Pesa phone number.');
      return;
    }
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          name: franchiseName,
          categories,
          phoneNumber,
          email: emailParam,
          amount: 50 // Demo amount
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment processing failed');

      // Save request ID to start polling
      setCheckoutRequestId(data.checkoutRequestId);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlassCard>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '8px' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your team <strong>{franchiseName}</strong> is registered.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px' }}>Redirecting to tournament portal...</p>
          </motion.div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className={styles.heroBg} />
      <div style={{ width: '100%', maxWidth: '500px', zIndex: 10 }}>
        <GlassCard>
          <div style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className={styles.brand} style={{ justifyContent: 'center', marginBottom: '24px' }}>
                <span className={styles.brandDot} />
                Tennis <span className={styles.brandAccent}>Suite</span> Checkout
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>Complete Registration</h2>
              <p style={{ color: 'var(--text-muted)' }}>Team: <strong>{franchiseName}</strong></p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#c9d1d9' }}>
                <span>Tournament Entry Fee</span>
                <span>Ksh 50</span>
              </div>
              {categories.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#c9d1d9', fontSize: '0.9rem' }}>
                  <span>Categories ({categories.length})</span>
                  <span>Included</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total Due</span>
                <span>Ksh 50</span>
              </div>
            </div>

            {checkoutRequestId ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', fontSize: '2rem', marginBottom: '16px' }}>⏳</motion.div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Check your phone</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We've sent an M-Pesa prompt to <strong>{phoneNumber}</strong>.<br/>Please enter your PIN to complete the payment.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#c9d1d9', marginBottom: '8px', fontSize: '0.9rem' }}>M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      color: '#c9d1d9',
                      outline: 'none'
                    }}
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)', marginBottom: '24px' }}>
                    {error}
                  </div>
                )}

                <DynamicButton 
                  onClick={handlePayment}
                  variant="primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Initiating..." : "Pay with M-Pesa"}
                </DynamicButton>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8b949e', marginTop: '16px', lineHeight: 1.5 }}>
                  Secure payment via Safaricom Daraja API.<br/>
                  Payments are processed by <strong>Savannah Atelier</strong>.
                </p>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
