'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // The middleware will automatically redirect us on the next reload
      // or we can push to root, which will then redirect
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card style={{ padding: '2rem', width: '400px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#f0f6fc', textAlign: 'center' }}>Login to Suite</h1>
          
          {error && (
            <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Email</label>
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
            <Button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter Walled Garden'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#8b949e' }}>
            Don't have a franchise? <a href="/register" style={{ color: '#58a6ff', textDecoration: 'none' }}>Register Here</a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
