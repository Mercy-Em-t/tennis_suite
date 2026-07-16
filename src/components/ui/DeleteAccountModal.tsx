'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function DeleteAccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('You must type DELETE exactly.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation })
      });

      const data = await res.json();

      if (data.success) {
        // Force hard reload to clear all states and trigger middleware
        window.location.href = '/login';
      } else {
        setError(data.error || 'An error occurred.');
        setLoading(false);
      }
    } catch (err) {
      setError('A network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '24px'
    }}>
      <div style={{
        background: '#161b22',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.15)'
      }}>
        <h2 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.4rem' }}>Delete Account</h2>
        <p style={{ color: '#8b949e', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
          This action will permanently anonymize your account to preserve historical tournament integrity, but all of your personal data and access will be immediately revoked. <strong>This cannot be undone.</strong>
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#c9d1d9', fontSize: '0.9rem', fontWeight: 600 }}>
            Type <span style={{ color: '#ef4444', userSelect: 'none' }}>DELETE</span> to confirm:
          </label>
          <input 
            type="text" 
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE"
            style={{
              width: '100%',
              padding: '12px',
              background: '#0d1117',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '6px',
              outline: 'none',
              fontFamily: 'monospace',
              fontSize: '1rem'
            }}
          />
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading || confirmation !== 'DELETE'}>
            {loading ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
