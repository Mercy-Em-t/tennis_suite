'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  tournament: any;
  stats: any;
  updateTournament: (updates: any) => Promise<void>;
  mutate: () => void;
}

const PHASE_LABELS: Record<string, string> = { 
  EARLY: 'REGISTRATION OPEN', 
  LATE: 'LATE REGISTRATION', 
  CLOSED: 'REGISTRATION CLOSED' 
};

const PHASE_VARIANTS: Record<string, 'success' | 'warning' | 'default'> = { 
  EARLY: 'success', 
  LATE: 'warning', 
  CLOSED: 'default' 
};

function groupByCategory(teams: any[]) {
  const map: Record<string, any[]> = {};
  teams?.forEach((t) => {
    const cats: string[] = JSON.parse(t.categories || '["Open"]');
    cats.forEach((cat) => { 
      if (!map[cat]) map[cat] = []; 
      map[cat].push(t); 
    });
  });
  return map;
}

export default function PreTournamentView({ tournament, stats, updateTournament, mutate }: Props) {
  const [activeStage, setActiveStage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // New states for CSV preview
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [importPaymentStatus, setImportPaymentStatus] = useState<'REGISTERED' | 'PENDING_PAYMENT'>('REGISTERED');

  // Deriving current progress based on flags
  const highestStageUnlocked = 
    tournament.isActive ? 4 :
    tournament.pools?.length > 0 ? 3 :
    tournament.registrationPhase === 'CLOSED' ? 3 : 2;

  const magicLink = typeof window !== 'undefined' ? `${window.location.origin}/tournaments/${tournament.slug || tournament.id}/register` : '';
  const staffLink = typeof window !== 'undefined' ? `${window.location.origin}/tournaments/${tournament.slug || tournament.id}/apply-staff` : '';
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}&bgcolor=0d1117&color=58a6ff`;

  const referees = tournament.staff?.filter((s: any) => s.role === 'REFEREE') || [];
  const marshalls = tournament.staff?.filter((s: any) => s.role === 'MARSHALL' || s.role === 'MARSHAL') || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(magicLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const seenTeamNames = new Set<string>();
        const seenEmails = new Set<string>();

        const previewRows = rows.map((row, index) => {
          const teamName = (row['Team Name'] || '').trim();
          const p1Name = (row['Player 1 Name'] || '').trim();
          const p1Email = (row['Player 1 Email'] || '').trim();
          const p2Name = (row['Player 2 Name'] || '').trim();
          const p2Email = (row['Player 2 Email'] || '').trim();
          const category = (row['Category'] || 'Open').trim();
          
          const errors = [];
          if (!teamName) errors.push('Missing Team Name');
          if (!p1Name) errors.push('Missing Player 1 Name');
          if (!p1Email) errors.push('Missing Player 1 Email');
          
          // Intra-CSV Duplicate Checks
          if (teamName) {
            if (seenTeamNames.has(teamName.toLowerCase())) errors.push('Duplicate Team Name in this CSV');
            seenTeamNames.add(teamName.toLowerCase());
          }
          if (p1Email) {
            if (seenEmails.has(p1Email.toLowerCase())) errors.push('Duplicate Player 1 in this CSV');
            seenEmails.add(p1Email.toLowerCase());
          }
          if (p2Email) {
            if (seenEmails.has(p2Email.toLowerCase())) errors.push('Duplicate Player 2 in this CSV');
            seenEmails.add(p2Email.toLowerCase());
          }

          // Idempotency Checks against existing teams
          const existingTeam = tournament.teams?.find((t: any) => t.franchiseName.toLowerCase() === teamName.toLowerCase());
          if (existingTeam) errors.push('Team Name already registered');

          const allExistingEmails = tournament.teams?.flatMap((t: any) => t.players?.map((p: any) => p.email.toLowerCase()) || []) || [];
          if (p1Email && allExistingEmails.includes(p1Email.toLowerCase())) errors.push('Player 1 already registered');
          if (p2Email && allExistingEmails.includes(p2Email.toLowerCase())) errors.push('Player 2 already registered');

          return {
            original: row,
            index,
            teamName, p1Name, p1Email, p2Name, p2Email, category,
            status: errors.length === 0 ? 'Valid' : 'Invalid',
            errors
          };
        });
        
        setCsvPreviewData(previewRows);
        setIsPreviewMode(true);
        e.target.value = ''; // reset file input
      }
    });
  };

  const confirmUpload = async () => {
    const validRows = csvPreviewData.filter(r => r.status === 'Valid').map(r => r.original);
    if (validRows.length === 0) {
      alert("No valid rows to upload.");
      setIsPreviewMode(false);
      return;
    }
    
    setUploading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows, paymentStatus: importPaymentStatus })
      });
      const resData = await res.json();
      if (resData.success) {
        alert(`Successfully ingested ${resData.count} franchises!`);
        mutate();
        setIsPreviewMode(false);
      } else {
        alert(`Ingestion Error: ${resData.error}`);
      }
    } catch (err) {
      alert('A network error occurred during ingestion.');
    } finally {
      setUploading(false);
    }
  };

  const S = {
    container: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: '48px', alignItems: 'start' } as React.CSSProperties,
    sidebar: { display: 'flex', flexDirection: 'column', gap: '8px' } as React.CSSProperties,
    navItem: (stage: number, unlocked: boolean) => ({
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: unlocked ? 'pointer' : 'not-allowed',
      background: activeStage === stage ? 'rgba(88,166,255,0.1)' : 'transparent',
      borderLeft: activeStage === stage ? '3px solid #58a6ff' : '3px solid transparent',
      color: activeStage === stage ? '#fff' : unlocked ? '#c9d1d9' : '#484f58',
      fontWeight: activeStage === stage ? 600 : 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none'
    }) as React.CSSProperties,
    card: { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', marginBottom: '24px' } as React.CSSProperties,
    h2: { margin: '0 0 24px', fontSize: '1.4rem', color: '#fff' } as React.CSSProperties,
    label: { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#8b949e', fontWeight: 600 } as React.CSSProperties,
    input: { width: '100%', padding: '10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', marginBottom: '16px', outline: 'none' } as React.CSSProperties,
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px', marginTop: '16px' } as React.CSSProperties,
    teamCard: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', padding: '18px' } as React.CSSProperties,
  };

  const renderStage1 = () => (
    <Card style={S.card}>
      <h2 style={S.h2}>Stage 1: Launch Tournament</h2>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>Verify details and assign officials to officially launch the tournament.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={S.label}>Tournament Name</label>
          <input style={S.input} value={tournament.name} readOnly />
        </div>
        <div>
          <label style={S.label}>Location / Venue</label>
          <input style={S.input} value={tournament.location || 'Not Specified'} readOnly />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={S.label}>Assigned Referee</label>
          <select style={S.input} defaultValue={referees[0]?.id || 'none'}>
            <option value="none">{referees.length > 0 ? `${referees[0].name} (Assigned)` : 'No Referee Assigned...'}</option>
            {referees.map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Assigned Marshall</label>
          <select style={S.input} defaultValue={marshalls[0]?.id || 'none'}>
            <option value="none">{marshalls.length > 0 ? `${marshalls[0].name} (Assigned)` : 'No Marshall Assigned...'}</option>
            {marshalls.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <Button variant="secondary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/staff`}>
          Manage Staff Directory
        </Button>
        <Button 
          variant={tournament.isActive ? 'secondary' : 'success'}
          disabled={tournament.isActive || isLaunching || tournament.isArchived}
          onClick={async () => {
            const missing = [];
            if (!tournament.startDate) missing.push('Start Date');
            if (!tournament.endDate) missing.push('End Date');
            if (!tournament.location) missing.push('Location');
            if (!tournament.contactEmail) missing.push('Contact Email');

            if (missing.length > 0) {
              alert(`Cannot launch. Please configure the following mandatory settings first:\n- ${missing.join('\n- ')}`);
              return;
            }

            setIsLaunching(true);
            try {
              const res = await fetch(`/api/tournaments/${tournament.id}/launch`, { method: 'POST' });
              const data = await res.json();
              if (data.success) {
                // Short artificial delay to let the spinner show for a moment
                await new Promise(r => setTimeout(r, 600));
                alert('Tournament Launched successfully! A notification email has been dispatched to the Host.');
                mutate();
                setActiveStage(2);
              } else {
                alert(`Failed to launch: ${data.error}`);
              }
            } catch (err) {
              alert('Network error while launching.');
            } finally {
              setIsLaunching(false);
            }
          }}
        >
          {tournament.isActive ? 'Tournament Already Launched' : isLaunching ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Launching...
            </span>
          ) : 'Launch Tournament'}
        </Button>
      </div>
      
      {tournament.isActive && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
          <Button 
            variant="primary"
            onClick={() => setActiveStage(2)}
          >
            Proceed to Registration Phase →
          </Button>
        </div>
      )}
    </Card>
  );

  const exportToCSV = () => {
    const allTeams = tournament.teams || [];
    const csvData = allTeams.map((t: any) => ({
      'Franchise Name': t.franchiseName,
      'Category': t.categories,
      'Status': t.status || 'ACTIVE',
      'Late Registration': t.isLateRegistration ? 'Yes' : 'No',
      'Players': t.players?.map((p: any) => p.name).join(' & ') || '',
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tournament.name}-registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateTeamStatus = async (teamId: string, status: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update team');
      mutate();
    } catch (e) {
      alert('Error updating team status');
    }
  };

  const renderStage2 = () => {
    const cats = groupByCategory(tournament.teams || []);
    const phase = tournament.registrationPhase || 'EARLY';
    const hasOpenedRegistration = (tournament.teams || []).length > 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 2: Registration Phase</h2>
            <Badge variant={PHASE_VARIANTS[phase]}>{PHASE_LABELS[phase]}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Player Magic Link</h4>
              <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '12px' }}>Send this URL to players to register for this tournament.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input readOnly value={magicLink} style={{ ...S.input, marginBottom: 0 }} />
                <Button variant="primary" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Call for Staff Link</h4>
              <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '12px' }}>Public application link for Referees and Marshalls.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input readOnly value={tournament.isActive ? staffLink : 'Tournament must be launched first'} style={{ ...S.input, marginBottom: 0, opacity: tournament.isActive ? 1 : 0.5 }} />
                <Button variant="primary" disabled={!tournament.isActive} onClick={() => {
                  navigator.clipboard.writeText(staffLink);
                  alert('Staff application link copied!');
                }}>Copy</Button>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: 0 }}>CSV Import (Roster Bulk Ingestion)</h4>
              <a href="/app/guides/csv-import" target="_blank" rel="noopener noreferrer" style={{ color: '#58a6ff', fontSize: '0.85rem', textDecoration: 'none' }}>View CSV Template Guide</a>
            </div>
            
            {!isPreviewMode ? (
              <>
                <p style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '12px' }}>Required: Team Name, Player 1 Name, Player 1 Email, etc.</p>
                <label style={{ display: 'inline-block', padding: '10px 18px', background: 'rgba(88,166,255,0.08)', border: '1px dashed rgba(88,166,255,0.4)', color: '#58a6ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  Choose CSV file
                  <input type='file' accept='.csv' onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
              </>
            ) : (
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#fff' }}>CSV Import Preview</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Badge variant="success">{csvPreviewData.filter(r => r.status === 'Valid').length} Valid</Badge>
                    <Badge variant="default">{csvPreviewData.filter(r => r.status === 'Invalid').length} Invalid</Badge>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h5 style={{ margin: '0 0 12px', color: '#fff', fontSize: '0.95rem' }}>Payment Status for this Batch</h5>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: importPaymentStatus === 'REGISTERED' ? '#fff' : '#8b949e', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="paymentStatus" 
                        value="REGISTERED" 
                        checked={importPaymentStatus === 'REGISTERED'} 
                        onChange={() => setImportPaymentStatus('REGISTERED')} 
                        style={{ accentColor: '#58a6ff' }}
                      />
                      Mark as Fully Paid (Offline)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: importPaymentStatus === 'PENDING_PAYMENT' ? '#fff' : '#8b949e', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="paymentStatus" 
                        value="PENDING_PAYMENT" 
                        checked={importPaymentStatus === 'PENDING_PAYMENT'} 
                        onChange={() => setImportPaymentStatus('PENDING_PAYMENT')}
                        style={{ accentColor: '#58a6ff' }}
                      />
                      Require Online Payment (Pending)
                    </label>
                  </div>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: '#c9d1d9' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Row</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Team</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Player 1</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status / Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreviewData.map((row) => (
                        <tr key={row.index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: row.status === 'Invalid' ? 'rgba(255,123,114,0.05)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px' }}>{row.index + 1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>{row.teamName || '-'}</td>
                          <td style={{ padding: '8px 12px' }}>
                            {row.p1Name} <span style={{ color: '#8b949e' }}>{row.p1Email ? `(${row.p1Email})` : ''}</span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {row.status === 'Valid' ? (
                              <span style={{ color: '#3fb950', fontWeight: 600 }}>Valid</span>
                            ) : (
                              <div style={{ color: '#ff7b72', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {row.errors.map((e: string, i: number) => <span key={i}>• {e}</span>)}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Button variant="secondary" onClick={() => setIsPreviewMode(false)} disabled={uploading}>Cancel</Button>
                  <Button variant="primary" onClick={confirmUpload} disabled={uploading || csvPreviewData.filter(r => r.status === 'Valid').length === 0}>
                    {uploading ? 'Processing...' : `Confirm & Upload ${csvPreviewData.filter(r => r.status === 'Valid').length} Valid Rows`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Registration Logic Banner */}
          {phase === 'EARLY' && tournament.registrationEnd && new Date() > new Date(tournament.registrationEnd) && (
            <div style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.4)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#d29922', display: 'block', marginBottom: '4px' }}>Early Registration Deadline Passed</strong>
                <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>The designated early registration period has ended. Please advance the phase.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant='secondary' onClick={() => {
                  if (window.confirm('Are you sure you want to close Early Registration and switch to Late Registration? This cannot be undone.')) {
                    updateTournament({ registrationPhase: 'LATE' });
                  }
                }}>Switch to Late</Button>
                <Button variant='danger' onClick={() => {
                  if (window.confirm('Are you sure you want to permanently close all registrations?')) {
                    updateTournament({ registrationPhase: 'CLOSED' });
                  }
                }}>Close Now</Button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>{(tournament.teams || []).length} Teams Registered</h3>
              <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>Across {Object.keys(cats).length} active divisions</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {phase === 'CLOSED' && (
                <Button 
                  variant='success' 
                  disabled={hasOpenedRegistration}
                  onClick={() => {
                    if (hasOpenedRegistration) return;
                    if (window.confirm('Are you sure you want to open Early Registration? This can only be done once.')) {
                      updateTournament({ registrationPhase: 'EARLY' });
                    }
                  }}
                >
                  {hasOpenedRegistration ? 'Early Registration Was Opened' : 'Open Early Registration'}
                </Button>
              )}
              {phase === 'EARLY' && <Button variant='secondary' onClick={() => {
                if (window.confirm('Are you sure you want to close Early Registration and switch to Late Registration? This cannot be undone.')) {
                  updateTournament({ registrationPhase: 'LATE' });
                }
              }}>Switch to Late Onsite Reg</Button>}
              {phase === 'LATE' && <Button variant='danger' onClick={() => {
                if (window.confirm('Are you sure you want to permanently close all registrations?')) {
                  updateTournament({ registrationPhase: 'CLOSED' });
                }
              }}>Close Registration</Button>}
            </div>
          </div>
        </Card>

        {/* Registrations List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Roster Bucket</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant='secondary' onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
                {viewMode === 'grid' ? 'Switch to Table View' : 'Switch to Grid View'}
              </Button>
              <Button variant='primary' onClick={exportToCSV}>Export to CSV</Button>
            </div>
          </div>
          
          {Object.keys(cats).length === 0 ? (
            <Card style={{ background: '#161b22', border: '1px dashed rgba(255,255,255,0.2)', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#8b949e', margin: 0 }}>No registrations yet.</p>
            </Card>
          ) : (
            viewMode === 'grid' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                {Object.entries(cats).map(([category, teams]) => (
                  <div key={category}>
                    <h3 style={{ color: '#d2a8ff', fontSize: '1.05rem', margin: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '8px' }}>
                      {category} <span style={{ color: '#8b949e', fontSize: '0.85rem', marginLeft: '8px' }}>({teams.length} teams)</span>
                    </h3>
                    <div style={S.teamGrid}>
                      {teams.map((t: any) => (
                        <Card key={t.id} style={{ ...S.teamCard, opacity: t.status === 'WITHDRAWN' || t.status === 'DISQUALIFIED' ? 0.5 : 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '1rem', color: '#fff' }}>
                              {t.franchiseName} {t.status === 'WITHDRAWN' && '(Withdrawn)'}
                            </strong>
                            {t.isLateRegistration && <Badge variant='warning'>LATE</Badge>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {t.players?.map((p: any) => (
                              <div key={p.id} style={{ fontSize: '0.875rem', color: '#8b949e' }}>
                                <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{p.name}</span><br />
                                <span style={{ fontSize: '0.8rem' }}>{p.email}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#c9d1d9', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#8b949e' }}>
                      <th style={{ padding: '12px 16px' }}>Team Name</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Late Reg?</th>
                      <th style={{ padding: '12px 16px' }}>Players</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tournament.teams || []).map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{t.franchiseName}</td>
                        <td style={{ padding: '12px 16px' }}>{t.categories}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant={t.status === 'WITHDRAWN' || t.status === 'DISQUALIFIED' ? 'default' : 'success'}>
                            {t.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{t.isLateRegistration ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {t.players?.map((p: any) => p.name).join(', ')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {(!t.status || t.status === 'ACTIVE') && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`Reject / Disqualify ${t.franchiseName}?`)) updateTeamStatus(t.id, 'DISQUALIFIED');
                              }}
                              style={{ background: 'transparent', color: '#ff7b72', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          )}
                          {(t.status === 'WITHDRAWN' || t.status === 'DISQUALIFIED') && (
                            <button 
                              onClick={() => updateTeamStatus(t.id, 'ACTIVE')}
                              style={{ background: 'transparent', color: '#58a6ff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderStage3 = () => (
    <Card style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 3: Pool Manager</h2>
        <Badge variant={tournament.pools?.length > 0 ? 'success' : 'warning'}>
          {tournament.pools?.length > 0 ? `${tournament.pools.length} Pools Configured` : 'DRAFT'}
        </Badge>
      </div>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>
        Seed players, generate pools serpentine layouts, and manage pool boundaries.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <Button variant="primary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/pools`}>
          Enter Pools & Seeding Workspace →
        </Button>
      </div>
    </Card>
  );

  const renderStage4 = () => (
    <Card style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Stage 4: Match Generation & Scheduling</h2>
        <Badge variant={tournament.isActive ? 'success' : 'warning'}>
          {tournament.isActive ? 'LIVE EVENT ACTIVE' : 'DRAFTING'}
        </Badge>
      </div>
      <p style={{ color: '#8b949e', marginBottom: '24px', lineHeight: 1.6 }}>
        Assign matches to physical court dispatcher queues, manage order of play, and configure timelines.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <Button variant="primary" onClick={() => window.location.href = `/app/dashboards/tournaments/${tournament.id}/dispatcher`}>
          Enter Match Dispatcher Grid →
        </Button>
      </div>

      {tournament.isActive && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
          <Button 
            variant="success"
            disabled={
              !tournament.isActive || 
              tournament.registrationPhase !== 'CLOSED' || 
              !(tournament.pools?.length > 0) || 
              !(tournament.matches?.length > 0)
            }
            onClick={async () => {
              if (window.confirm('Are you ready to transition to the During-Tournament phase? Matches will go live.')) {
                await updateTournament({ lifecyclePhase: 'DURING_TOURNAMENT' });
              }
            }}
          >
            {tournament.matches?.length > 0 && tournament.pools?.length > 0 && tournament.registrationPhase === 'CLOSED' ? 'Transition to Live Event (During-Tournament) →' : 'Complete all Stages (1-4) to transition to Live'}
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div style={S.container}>
      <div style={S.sidebar}>
        <button 
          style={S.navItem(1, true)} 
          onClick={() => setActiveStage(1)}
        >
          <span>1. Launch</span>
          {tournament.isActive && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(2, tournament.isActive)} 
          onClick={() => tournament.isActive && setActiveStage(2)}
        >
          <span>2. Registration</span>
          {tournament.registrationPhase === 'CLOSED' && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(3, tournament.registrationPhase === 'CLOSED' || tournament.registrationPhase === 'LATE')} 
          onClick={() => (tournament.registrationPhase === 'CLOSED' || tournament.registrationPhase === 'LATE') && setActiveStage(3)}
        >
          <span>3. Pool Manager</span>
          {tournament.pools?.length > 0 && <Badge variant="success">Done</Badge>}
        </button>
        <button 
          style={S.navItem(4, tournament.pools?.length > 0)} 
          onClick={() => tournament.pools?.length > 0 && setActiveStage(4)}
        >
          <span>4. Match Generation & Scheduling</span>
          {tournament.isActive && <Badge variant="success">Done</Badge>}
        </button>
      </div>

      <div>
        {activeStage === 1 && renderStage1()}
        {activeStage === 2 && renderStage2()}
        {activeStage === 3 && renderStage3()}
        {activeStage === 4 && renderStage4()}
      </div>
    </div>
  );
}
