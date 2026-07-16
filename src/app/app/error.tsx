'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AppScopeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Boundary]', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: '#0d1117' }}>
      <Card style={{ padding: '48px', maxWidth: '500px', textAlign: 'center', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '16px' }}>Dashboard Error</h2>
        <p style={{ color: '#8b949e', marginBottom: '32px', lineHeight: 1.5 }}>
          A component crashed inside the application interface.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="primary" onClick={() => reset()}>
            Reload Component
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/app/dashboards/player'}>
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
