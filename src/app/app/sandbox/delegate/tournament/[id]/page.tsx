'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDelegateState } from '../../useDelegateState';

export default function SpecificDelegateDashboard() {
  const { 
    auditLogs, financials, broadcasts, systemSuspended, loaded, 
    appendAuditLog, addBroadcast, updateFinancials, toggleSystemSuspension 
  } = useDelegateState();

  const [unlocked, setUnlocked] = useState(false);
  const [reasonModal, setReasonModal] = useState<{ active: boolean, action: string, title: string, payload?: any }>({ active: false, action: '', title: '' });
  const [reasonText, setReasonText] = useState('');

  // Broadcast state
  const [bcastText, setBcastText] = useState('');
  const [bcastTarget, setBcastTarget] = useState<'ALL' | 'HOSTS' | 'REFEREES' | 'MARSHALLS'>('ALL');
  const [bcastEmergency, setBcastEmergency] = useState(false);

  if (!loaded) return <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading...</div>;

  const handleExecuteAction = () => {
    if (!reasonText.trim()) return;

    if (reasonModal.action === 'KILL_SWITCH') {
      toggleSystemSuspension(reasonText);
    } else if (reasonModal.action === 'REFUND') {
      updateFinancials({ totalRevenue: financials.totalRevenue - 100, prizePool: financials.prizePool - 10 });
      appendAuditLog('Issued Mock Refund ($100)', 'Delegate', 'WARNING', reasonText);
    } else {
      // General interventions (Disqualify, Reseed, etc.)
      appendAuditLog(`Executed Intervention: ${reasonModal.title}`, 'Delegate', 'CRITICAL', reasonText);
    }

    setReasonModal({ active: false, action: '', title: '' });
    setReasonText('');
    setUnlocked(false); // Auto-lock after high impact action
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcastText.trim()) return;
    addBroadcast(bcastText, bcastTarget, bcastEmergency);
    setBcastText('');
    setBcastEmergency(false);
  };

  const baseColor = unlocked ? '#f85149' : '#58a6ff';
  const bgAccent = unlocked ? 'rgba(248,81,73,0.05)' : 'rgba(88,166,255,0.02)';

  const S = {
    page: { padding: '24px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' } as React.CSSProperties,
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', height: 'calc(100vh - 120px)' } as React.CSSProperties,
    col: { display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '12px' } as React.CSSProperties,
    card: { background: '#161b22', border: `1px solid ${unlocked ? 'rgba(248,81,73,0.3)' : 'rgba(255,255,255,0.1)'}`, padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' } as React.CSSProperties,
    h3: { margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      
      {/* KILL SWITCH OVERLAY */}
      {systemSuspended && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(248,81,73,0.15)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ transform: 'rotate(-15deg)', border: '4px solid #f85149', color: '#f85149', padding: '16px 32px', fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', opacity: 0.5 }}>
            System Suspended
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `2px solid ${baseColor}`, paddingBottom: '16px', zIndex: 110, position: 'relative' }}>
        <div>
          <Button variant="secondary" onClick={() => window.location.href = '/sandbox/delegate'} style={{ padding: '4px 8px', fontSize: '0.8rem', marginBottom: '12px' }}>← Global Dashboard</Button>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: unlocked ? '#f85149' : '#fff' }}>
            {unlocked ? '⚠️ GOD-MODE UNLOCKED' : 'Delegate Command Center'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${unlocked ? '#f85149' : '#30363d'}` }}>
            <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Safety Protocol:</span>
            <input type="checkbox" checked={unlocked} onChange={(e) => setUnlocked(e.target.checked)} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
            <span style={{ fontWeight: 'bold', color: unlocked ? '#f85149' : '#3fb950' }}>{unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
          </div>
          
          {/* THE KILL SWITCH */}
          <Button 
            variant="destructive"
            style={{ fontSize: '1.2rem', padding: '12px 24px', fontWeight: 900, boxShadow: systemSuspended ? '0 0 20px #f85149' : 'none' }}
            onClick={() => setReasonModal({ active: true, action: 'KILL_SWITCH', title: systemSuspended ? 'Revoke Suspension (Bring Online)' : 'Trigger Global Kill Switch' })}
          >
            {systemSuspended ? 'REVOKE KILL SWITCH' : '🛑 KILL SWITCH'}
          </Button>
        </div>
      </header>

      <div style={S.layout}>
        
        {/* COL 1: Command & Direct Modules */}
        <div style={S.col}>
          
          <Card style={S.card}>
            <h3 style={S.h3}>I. Command (Broadcasts)</h3>
            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select value={bcastTarget} onChange={e => setBcastTarget(e.target.value as any)} style={{ background: '#0d1117', color: '#fff', border: '1px solid #30363d', padding: '8px', borderRadius: '6px', flex: 1 }}>
                  <option value="ALL">All Personas</option>
                  <option value="HOSTS">Hosts Only</option>
                  <option value="REFEREES">Referees Only</option>
                  <option value="MARSHALLS">Marshalls Only</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#f85149', background: 'rgba(248,81,73,0.1)', padding: '0 12px', borderRadius: '6px' }}>
                  <input type="checkbox" checked={bcastEmergency} onChange={e => setBcastEmergency(e.target.checked)} />
                  Emergency Override
                </label>
              </div>
              <textarea 
                placeholder="Type global broadcast message..." 
                value={bcastText}
                onChange={e => setBcastText(e.target.value)}
                style={{ background: '#0d1117', color: '#fff', border: '1px solid #30363d', padding: '12px', borderRadius: '6px', minHeight: '80px', fontFamily: 'inherit' }}
              />
              <Button variant="primary" type="submit">Inject Broadcast</Button>
            </form>
          </Card>

          <Card style={{ ...S.card, background: bgAccent }}>
            <h3 style={S.h3}>II. Direct (Interventions)</h3>
            <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: 0 }}>Requires Safety Protocol Unlock.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none' }}>
              <Button variant="warning" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Manual Score Override' })}>Force Manual Score Override</Button>
              <Button variant="destructive" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Disqualify Player / Team' })}>Disqualify Player</Button>
              <Button variant="secondary" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Reseed Bracket' })}>Force Reseed Bracket</Button>
            </div>
          </Card>

        </div>

        {/* COL 2: Watchdog & Fiscal */}
        <div style={S.col}>
          
          <Card style={S.card}>
            <h3 style={S.h3}>IV. Treasury (Fiscal Oversight)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #30363d' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Total Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3fb950' }}>${financials.totalRevenue}</div>
              </div>
              <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #30363d' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Prize Pool</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0f6fc' }}>${financials.prizePool}</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              style={{ marginTop: '8px', opacity: unlocked ? 1 : 0.5, pointerEvents: unlocked ? 'auto' : 'none' }}
              onClick={() => setReasonModal({ active: true, action: 'REFUND', title: 'Mock Issue Refund (-$100)' })}
            >
              Issue Manual Refund
            </Button>
          </Card>

          <Card style={{ ...S.card, flex: 1 }}>
            <h3 style={S.h3}>Active Broadcasts</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {broadcasts.length === 0 ? <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>No active broadcasts.</p> : null}
              {broadcasts.map(b => (
                <div key={b.id} style={{ padding: '12px', background: '#0d1117', borderRadius: '6px', borderLeft: `4px solid ${b.isEmergency ? '#f85149' : '#58a6ff'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#8b949e' }}>
                    <Badge variant={b.isEmergency ? 'destructive' : 'primary'}>TARGET: {b.target}</Badge>
                    <span>{b.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: b.isEmergency ? '#f85149' : '#c9d1d9' }}>{b.message}</div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* COL 3: Audit Trail */}
        <div style={S.col}>
          <Card style={{ ...S.card, flex: 1, background: '#0d1117' }}>
            <h3 style={S.h3}>
              III. Audit Trail
              <Badge variant="secondary">Immutable</Badge>
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ padding: '12px', background: '#161b22', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: log.severity === 'CRITICAL' ? '#f85149' : log.severity === 'WARNING' ? '#d2a8ff' : '#58a6ff' }}>
                      {log.actor}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: log.severity === 'CRITICAL' ? 600 : 400 }}>{log.action}</div>
                  {log.reason && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderLeft: '2px solid #8b949e', fontSize: '0.8rem', color: '#c9d1d9', fontStyle: 'italic' }}>
                      " {log.reason} "
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* The "Why" Modal */}
      {reasonModal.active && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <Card style={{ background: '#161b22', padding: '32px', width: '500px', border: `2px solid ${reasonModal.action === 'KILL_SWITCH' ? '#f85149' : '#d2a8ff'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.4rem' }}>{reasonModal.title}</h2>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '24px' }}>
              <strong>Mandatory Protocol:</strong> You must provide justification for this action. This will be permanently recorded in the public Audit Trail.
            </p>

            <textarea 
              autoFocus
              placeholder="Enter justification reasoning..." 
              value={reasonText}
              onChange={e => setReasonText(e.target.value)}
              style={{ width: '100%', background: '#0d1117', color: '#fff', border: '1px solid #30363d', padding: '16px', borderRadius: '6px', minHeight: '120px', fontFamily: 'inherit', marginBottom: '24px' }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setReasonModal({ active: false, action: '', title: '' }); setReasonText(''); }}>Abort</Button>
              <Button variant="destructive" onClick={handleExecuteAction} disabled={!reasonText.trim()}>COMMIT ACTION</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
