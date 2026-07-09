'use client';

import React, { useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ApplyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tournamentId = params.id as string;
  const role = searchParams.get('role')?.toUpperCase() || 'REFEREE';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/tournaments/${tournamentId}/apply?role=${role}`);
          return;
        }
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0d1117' }}>
      <Card style={{ maxWidth: '400px', width: '100%', padding: '32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px' }}>Application Sent!</h2>
            <p style={{ color: '#8b949e', marginBottom: '24px' }}>
              Your application to be a {role} has been submitted. The Tournament Host will review it shortly.
            </p>
            <Button onClick={() => router.push('/')} variant="outline" style={{ width: '100%' }}>Return Home</Button>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#fff', marginBottom: '16px', textAlign: 'center' }}>Apply for Staff Role</h2>
            <p style={{ color: '#8b949e', marginBottom: '32px', textAlign: 'center' }}>
              You have been invited to apply as a <strong>{role}</strong> for this tournament.
            </p>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: '6px', marginBottom: '24px' }}>
                {error}
              </div>
            )}

            <Button 
              onClick={handleApply} 
              disabled={isSubmitting} 
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Submitting...' : `Apply to be a ${role}`}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
