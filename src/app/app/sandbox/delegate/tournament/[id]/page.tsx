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

  if (!loaded) return <div >Loading...</div>;

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
        <div >
          <div >
            System Suspended
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `2px solid ${baseColor}`, paddingBottom: '16px', zIndex: 110, position: 'relative' }}>
        <div>
          <Button variant="secondary" onClick={() => window.location.href = '/sandbox/delegate'} >← Global Dashboard</Button>
          <h1 >
            {unlocked ? '⚠️ GOD-MODE UNLOCKED' : 'Delegate Command Center'}
          </h1>
        </div>
        <div >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${unlocked ? '#f85149' : '#30363d'}` }}>
            <span >Safety Protocol:</span>
            <input type="checkbox" checked={unlocked} onChange={(e) => setUnlocked(e.target.checked)}  />
            <span >{unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
          </div>
          
          {/* THE KILL SWITCH */}
          <Button 
            variant="danger"
            
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
            <form onSubmit={handleSendBroadcast} >
              <div >
                <select value={bcastTarget} onChange={e => setBcastTarget(e.target.value as any)} >
                  <option value="ALL">All Personas</option>
                  <option value="HOSTS">Hosts Only</option>
                  <option value="REFEREES">Referees Only</option>
                  <option value="MARSHALLS">Marshalls Only</option>
                </select>
                <label >
                  <input type="checkbox" checked={bcastEmergency} onChange={e => setBcastEmergency(e.target.checked)} />
                  Emergency Override
                </label>
              </div>
              <textarea 
                placeholder="Type global broadcast message..." 
                value={bcastText}
                onChange={e => setBcastText(e.target.value)}
                
              />
              <Button variant="secondary" type="submit">Inject Broadcast</Button>
            </form>
          </Card>

          <Card >
            <h3 style={S.h3}>II. Direct (Interventions)</h3>
            <p >Requires Safety Protocol Unlock.</p>
            <div >
              <Button variant="danger" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Manual Score Override' })}>Force Manual Score Override</Button>
              <Button variant="danger" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Disqualify Player / Team' })}>Disqualify Player</Button>
              <Button variant="secondary" onClick={() => setReasonModal({ active: true, action: 'INTERVENTION', title: 'Reseed Bracket' })}>Force Reseed Bracket</Button>
            </div>
          </Card>

        </div>

        {/* COL 2: Watchdog & Fiscal */}
        <div style={S.col}>
          
          <Card style={S.card}>
            <h3 style={S.h3}>IV. Treasury (Fiscal Oversight)</h3>
            <div >
              <div >
                <div >Total Revenue</div>
                <div >${financials.totalRevenue}</div>
              </div>
              <div >
                <div >Prize Pool</div>
                <div >${financials.prizePool}</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              
              onClick={() => setReasonModal({ active: true, action: 'REFUND', title: 'Mock Issue Refund (-$100)' })}
            >
              Issue Manual Refund
            </Button>
          </Card>

          <Card >
            <h3 style={S.h3}>Active Broadcasts</h3>
            <div >
              {broadcasts.length === 0 ? <p >No active broadcasts.</p> : null}
              {broadcasts.map(b => (
                <div key={b.id} style={{ padding: '12px', background: '#0d1117', borderRadius: '6px', borderLeft: `4px solid ${b.isEmergency ? '#f85149' : '#58a6ff'}` }}>
                  <div >
                    <Badge variant={b.isEmergency ? 'error' : 'default'}>TARGET: {b.target}</Badge>
                    <span>{b.timestamp}</span>
                  </div>
                  <div >{b.message}</div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* COL 3: Audit Trail */}
        <div style={S.col}>
          <Card >
            <h3 style={S.h3}>
              III. Audit Trail
              <Badge variant="default">Immutable</Badge>
            </h3>
            <div >
              {auditLogs.map(log => (
                <div key={log.id} >
                  <div >
                    <span >
                      {log.actor}
                    </span>
                    <span >{log.timestamp}</span>
                  </div>
                  <div >{log.action}</div>
                  {log.reason && (
                    <div >
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
        <div >
          <Card style={{ background: '#161b22', padding: '32px', width: '500px', border: `2px solid ${reasonModal.action === 'KILL_SWITCH' ? '#f85149' : '#d2a8ff'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 >{reasonModal.title}</h2>
            <p >
              <strong>Mandatory Protocol:</strong> You must provide justification for this action. This will be permanently recorded in the public Audit Trail.
            </p>

            <textarea 
              autoFocus
              placeholder="Enter justification reasoning..." 
              value={reasonText}
              onChange={e => setReasonText(e.target.value)}
              
            />

            <div >
              <Button variant="secondary" onClick={() => { setReasonModal({ active: false, action: '', title: '' }); setReasonText(''); }}>Abort</Button>
              <Button variant="danger" onClick={handleExecuteAction} disabled={!reasonText.trim()}>COMMIT ACTION</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
