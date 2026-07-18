'use client';

import React, { useState, use } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StaffManagementWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // We'll fetch staff directly from a new GET endpoint or via the tournament object. 
  // Let's assume the tournament object includes `staff`. We need to make sure the tournament API includes it.
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  
  const [directEmail, setDirectEmail] = useState('');
  const [directRole, setDirectRole] = useState('REFEREE');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div style={{ padding: '24px', color: '#8b949e' }}>Loading Staff Workspace...</div>;
  if (error) return <div style={{ padding: '24px', color: '#f85149' }}>SWR Error: {error.message || String(error)}</div>;
  if (!data?.success) return <div style={{ padding: '24px', color: '#f85149' }}>Failed to load tournament data. API Data: {JSON.stringify(data)} Params ID: {resolvedParams?.id}</div>;

  const tournament = data.tournament;
  // Ensure staff array exists (we'll update the tournament GET API if needed, assuming it's returned here)
  const staffMembers = tournament.staff || []; 

  const pendingStaff = staffMembers.filter((s: any) => s.status === 'PENDING');
  const approvedStaff = staffMembers.filter((s: any) => s.status === 'APPROVED');

  const handleUpdateStatus = async (staffId: string, status: string) => {
    setSubmitting(true);
    await fetch(`/api/tournaments/${resolvedParams.id}/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId, status })
    });
    setSubmitting(false);
    mutate(); // re-fetch SWR
  };

  const handleDirectAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail) return;

    setSubmitting(true);
    const res = await fetch(`/api/tournaments/${resolvedParams.id}/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directEmail, role: directRole })
    });
    const d = await res.json();
    setSubmitting(false);

    if (d.success) {
      alert("Staff member directly assigned!");
      setDirectEmail('');
      mutate();
    } else {
      alert(`Error: ${d.error}`);
    }
  };

  // Magic Link Generation
  // In a real app, you'd use the full origin. We'll show a relative or mocked absolute URL for MVP.
  const magicLink = `https://tennissuite.app/tournaments/${resolvedParams.id}/staff/apply`;

  return (
    <div style={{ padding: '48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#58a6ff' }}>Role Delegation</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Manage Referees, Marshalls, and Admins.</p>
        </div>
        <Button variant="secondary" onClick={() => router.push(`/app/dashboards/tournaments/${resolvedParams.id}`)}>Back to Dashboard</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        
        {/* Left Column: Applications and Roster */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Pending Applications ({pendingStaff.length})</h2>
          {pendingStaff.length === 0 ? (
            <Card style={{ background: '#161b22', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ color: '#8b949e', margin: 0 }}>No pending applications.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {pendingStaff.map((staff: any) => (
                <Card key={staff.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px' }}>{staff.user?.name || staff.user?.email || 'Unknown User'}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Applied for: <strong>{staff.role}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="primary" onClick={() => handleUpdateStatus(staff.id, 'APPROVED')} disabled={submitting}>Approve</Button>
                    <Button variant="danger" onClick={() => handleUpdateStatus(staff.id, 'REJECTED')} disabled={submitting}>Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Active Roster ({approvedStaff.length})</h2>
          {approvedStaff.length === 0 ? (
            <Card style={{ background: '#161b22', padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#8b949e', margin: 0 }}>No active staff.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {approvedStaff.map((staff: any) => (
                <Card key={staff.id} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px' }}>{staff.user?.name || staff.user?.email || 'Unknown User'}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Role: <strong>{staff.role}</strong></span>
                  </div>
                  <Button variant="danger" onClick={() => handleUpdateStatus(staff.id, 'REJECTED')} disabled={submitting}>Revoke Access</Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Invites and Magic Link */}
        <div>
          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px' }}>Direct Assignment</h3>
            <p style={{ color: '#8b949e', marginBottom: '24px', fontSize: '0.9rem' }}>Assign a role directly to an existing user by their email address.</p>
            <form onSubmit={handleDirectAssign}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e' }}>User Email</label>
                <input 
                  type="email" 
                  required 
                  value={directEmail} 
                  onChange={(e) => setDirectEmail(e.target.value)} 
                  placeholder="e.g. ref@example.com"
                  style={{ width: '100%', padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e' }}>Role</label>
                <select 
                  value={directRole} 
                  onChange={(e) => setDirectRole(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                >
                  <option value="REFEREE">Referee</option>
                  <option value="MARSHALL">Court Marshall</option>
                  <option value="ADMIN">Tournament Admin</option>
                </select>
              </div>
              <Button type="submit" variant="primary" disabled={submitting} style={{ width: '100%' }}>Assign Role</Button>
            </form>
          </Card>

          <Card style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px' }}>Public Application Link</h3>
            <p style={{ color: '#8b949e', marginBottom: '24px', fontSize: '0.9rem' }}>Share this link in your community to allow users to apply for staffing roles.</p>
            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', color: '#58a6ff', wordBreak: 'break-all' }}>
              {magicLink}
            </div>
            <Button 
              variant="secondary" 
              style={{ width: '100%', marginTop: '16px' }}
              onClick={() => { navigator.clipboard.writeText(magicLink); alert('Copied to clipboard!'); }}
            >
              Copy Link
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
