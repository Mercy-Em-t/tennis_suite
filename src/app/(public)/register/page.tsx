'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';

function RegisterForm() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('t');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [franchiseName, setFranchiseName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = { name, email, password, franchiseName };
      if (tournamentId) payload.tournamentId = tournamentId;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = '/team';
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: '2rem', width: '450px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f0f6fc', textAlign: 'center' }}>Player Registration</h1>
      <p style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.875rem', marginBottom: '2rem' }}>
        {tournamentId ? 'You have been invited via Magic Link' : 'Join the global Purely Doubles circuit.'}
      </p>
      
      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
          {error}
        </div>
      )}

      {tournamentId && (
        <div style={{ background: 'rgba(126, 231, 135, 0.1)', border: '1px solid #7ee787', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#7ee787', fontSize: '0.875rem', textAlign: 'center' }}>
          <strong>Locked to Tournament ID:</strong> {tournamentId}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }}
            required 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }}
            required 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }}
            required 
          />
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.5rem 0', paddingTop: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Team Franchise Name</label>
          <input 
            type="text" 
            value={franchiseName} 
            onChange={e => setFranchiseName(e.target.value)}
            placeholder="e.g. Federer / Nadal"
            style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }}
            required
          />
        </div>

        <Button type="submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Processing...' : 'Complete Registration'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#8b949e' }}>
        Already registered? <a href="/login" style={{ color: '#58a6ff', textDecoration: 'none' }}>Login Here</a>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Suspense fallback={<div style={{ color: '#8b949e' }}>Loading Gateway...</div>}>
          <RegisterForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
