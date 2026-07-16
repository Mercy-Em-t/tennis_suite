'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Boundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui, sans-serif' }}>
          <Card style={{ padding: '48px', maxWidth: '500px', textAlign: 'center', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💥</div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '16px' }}>Something went wrong!</h1>
            <p style={{ color: '#8b949e', marginBottom: '32px', lineHeight: 1.5 }}>
              A critical error occurred while rendering this page. We've logged this incident. 
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => reset()}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/'}>
                Return Home
              </Button>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}
