'use client';

import React, { useState, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('t');
  const franchiseName = searchParams.get('f');
  const categoriesParam = searchParams.get('c');
  const categories = categoriesParam ? JSON.parse(decodeURIComponent(categoriesParam)) : [];
  const src = searchParams.get('src');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'MPESA'>('STRIPE');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');

    if (paymentMethod === 'MPESA' && !phoneNumber.trim()) {
      setError('Please enter a valid M-Pesa phone number.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId, 
          franchiseName, 
          paymentMethod,
          phoneNumber: paymentMethod === 'MPESA' ? phoneNumber : undefined,
          categories
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  if (!tournamentId || !franchiseName) {
    return <div style={{ color: '#f85149' }}>Invalid Checkout Session. Missing parameters.</div>;
  }

  if (success) {
    return (
      <Card style={{ padding: '2rem', width: '450px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', color: '#f0f6fc', marginBottom: '12px' }}>Registration Complete!</h2>
          <p style={{ color: '#8b949e', marginBottom: '8px' }}>Your payment was successful and your team is securely registered.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1f6feb', borderRadius: '8px', padding: '16px', marginTop: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '8px' }}>📧 Check Your Inbox!</h3>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: 1.5 }}>
              We've sent a <strong>Registration Confirmation</strong> email to you. It contains a magic link that will securely log you in to your Player Hub, where you can view your schedule and matchups!
            </p>
          </div>

          <Button onClick={() => window.location.href = src === 'app' ? '/app/dashboards/player' : '/'} style={{ width: '100%', background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d' }}>
            {src === 'app' ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
        </motion.div>
      </Card>
    );
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

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button 
            onClick={() => setPaymentMethod('STRIPE')}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '6px', 
              background: paymentMethod === 'STRIPE' ? 'rgba(31,111,235,0.1)' : '#0d1117',
              border: `1px solid ${paymentMethod === 'STRIPE' ? '#1f6feb' : '#30363d'}`,
              color: paymentMethod === 'STRIPE' ? '#58a6ff' : '#8b949e',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease'
            }}>
            Credit Card
          </button>
          <button 
            onClick={() => setPaymentMethod('MPESA')}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '6px', 
              background: paymentMethod === 'MPESA' ? 'rgba(63,185,80,0.1)' : '#0d1117',
              border: `1px solid ${paymentMethod === 'MPESA' ? '#3fb950' : '#30363d'}`,
              color: paymentMethod === 'MPESA' ? '#7ee787' : '#8b949e',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease'
            }}>
            M-Pesa
          </button>
        </div>
        
        {paymentMethod === 'MPESA' && (
          <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e' }}>M-Pesa Phone Number</label>
            <input 
              type="text" 
              placeholder="e.g. 0700 000 000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#0d1117', border: '1px solid #30363d',
                borderRadius: '6px', color: '#f0f6fc', fontSize: '1rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '8px' }}>
              We will send an STK push prompt directly to your phone. Enter your M-Pesa PIN to complete payment.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
          {error}
        </div>
      )}

      <Button 
        onClick={handlePay} 
        style={{ 
          width: '100%', padding: '16px', fontSize: '1.1rem',
          background: paymentMethod === 'MPESA' ? '#238636' : undefined,
          color: '#fff'
        }} 
        disabled={loading}
      >
        {loading ? 'Processing...' : paymentMethod === 'MPESA' ? 'Pay via M-Pesa' : 'Pay with Stripe'}
      </Button>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: '#8b949e' }}>
        This is a simulated Sandbox environment. No real funds are transferred.
      </p>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#f0f6fc', fontFamily: 'Inter, sans-serif' }}>
      <Suspense fallback={<div style={{ color: '#8b949e' }}>Loading Secure Checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
