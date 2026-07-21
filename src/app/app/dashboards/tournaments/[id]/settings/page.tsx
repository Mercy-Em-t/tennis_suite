'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: '0.75rem', color: '#6e7681' }}>{hint}</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '7px',
  padding: '10px 14px',
  color: '#f0f6fc',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
};

function Section({ title, color = '#58a6ff', children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid rgba(255,255,255,0.07)',
      borderLeft: `3px solid ${color}`,
      borderRadius: '10px',
      padding: '28px 28px',
      marginBottom: '20px',
    }}>
      <h2 style={{
        fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color, margin: '0 0 20px',
      }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
        {children}
      </div>
    </div>
  );
}

const DEFAULT_CATEGORIES = [
  "Men's Singles",
  "Women's Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles"
];

export default function TournamentSettings({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  
  const [form, setForm] = useState<Record<string, string>>({});
  const [contactEmailType, setContactEmailType] = useState<'default' | 'custom'>('default');
  const [uploadingFlyer, setUploadingFlyer] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [categories, setCategories] = useState<string[]>([]);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [scoringRules, setScoringRules] = useState({
    setsToWin: "2",
    gamesPerSet: "6",
    tiebreakAt: "6",
    advantage: "Standard"
  });

  // Populate form once data loads
  useEffect(() => {
    if (data?.tournament) {
      const t = data.tournament;
      
      const isDefaultEmail = !t.contactEmail || t.contactEmail === t.host?.email;
      setContactEmailType(isDefaultEmail ? 'default' : 'custom');

      let parsedScoringRules = {
        setsToWin: "2",
        gamesPerSet: "6",
        tiebreakAt: "6",
        advantage: "Standard"
      };

      try {
        if (t.scoringRules) {
          const parsed = JSON.parse(t.scoringRules);
          parsedScoringRules = { ...parsedScoringRules, ...parsed };
        }
      } catch (e) {
        // Fallback for legacy string rules
      }

      setScoringRules(parsedScoringRules);

      if (t.categories) {
        setCategories(t.categories.split(",").map((c: string) => c.trim()).filter((c: string) => c));
      }

      setForm({
        name: t.name ?? '',
        location: t.location ?? '',
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        endDate: t.endDate ? t.endDate.split('T')[0] : '',
        registrationStart: t.registrationStart ? t.registrationStart.split('T')[0] : '',
        registrationEnd: t.registrationEnd ? t.registrationEnd.split('T')[0] : '',
        formatType: t.formatType ?? '',
        matchDuration: t.matchDuration ? String(t.matchDuration) : '',
        surfaceType: t.surfaceType ?? '',
        maxTeams: t.maxTeams ? String(t.maxTeams) : '',
        allowMultiCategory: t.allowMultiCategory ? 'true' : 'false',
        logoUrl: t.logoUrl ?? '',
        sponsorUrl: t.sponsorUrl ?? '',
        contactEmail: t.contactEmail ?? '',
        contactPhone: t.contactPhone ?? '',
        registrationFee: t.registrationFee ? String(t.registrationFee) : '',
      });
    }
  }, [data]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleScoringChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScoringRules(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory("");
      setShowOtherCategory(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      const parseDate = (d: string | undefined) => {
        if (!d) return null;
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt.toISOString();
      };

      const payload = {
        ...form,
        allowMultiCategory: form.allowMultiCategory === 'true',
        maxTeams: form.maxTeams ? parseInt(form.maxTeams) : undefined,
        matchDuration: form.matchDuration ? parseInt(form.matchDuration) : undefined,
        registrationFee: form.registrationFee ? parseInt(form.registrationFee) : undefined,
        startDate: parseDate(form.startDate),
        endDate: parseDate(form.endDate),
        registrationStart: parseDate(form.registrationStart),
        registrationEnd: parseDate(form.registrationEnd),
        contactEmail: contactEmailType === 'default' ? data?.tournament?.host?.email : form.contactEmail,
        scoringRules: JSON.stringify(scoringRules),
        categories: categories.join(", ")
      };

      const res = await fetch(`/api/tournaments/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save settings');
      }

      await mutate();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMsg(err.message ?? 'Unknown error');
    }
  };

  const handleUpdateTeamStatus = async (teamId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this team as ${newStatus}? This will award Walkovers for their pending pool matches and flag their knockout matches for intervention.`)) return;

    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/teams/${teamId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await mutate();
      alert(`Team successfully marked as ${newStatus}. Cascade applied.`);
    } catch (err: any) {
      alert(`Error updating team: ${err.message}`);
    }
  };

  const backPath = `/app/dashboards/tournaments/${resolvedParams.id}`;

  if (isLoading) return (
    <div style={{ padding: '48px', color: '#8b949e', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      Loading settings...
    </div>
  );

  if (error || !data?.tournament) return (
    <div style={{ padding: '48px', color: '#f85149', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      Failed to load tournament data.
    </div>
  );

  const t = data.tournament;

  return (
    <div style={{ padding: '40px 48px', color: '#f0f6fc', background: '#0d1117', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => router.push(backPath)}
          style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.875rem', padding: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to {t.name}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 4px', color: '#fff', letterSpacing: '-0.02em' }}>
              Tournament Settings
            </h1>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.9rem' }}>
              {t.name} &mdash; <code style={{ color: '#58a6ff', fontSize: '0.8rem' }}>{t.slug || t.id}</code>
            </p>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              style={{
                background: saveStatus === 'saved' ? '#238636' : saveStatus === 'error' ? '#b91c1c' : '#1f6feb',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600,
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                opacity: saveStatus === 'saving' ? 0.7 : 1,
                transition: 'all 0.2s ease', minWidth: '140px',
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '✗ Error' : 'Save Changes'}
            </button>
            {saveStatus === 'error' && (
              <span style={{ fontSize: '0.75rem', color: '#f85149' }}>{errorMsg}</span>
            )}
            {saveStatus === 'saved' && (
              <span style={{ fontSize: '0.75rem', color: '#3fb950' }}>All changes saved successfully</span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section title="Basic Information" color="#58a6ff">
        <Field label="Tournament Name *">
          <input style={inputStyle} value={form.name ?? ''} onChange={set('name')} placeholder="e.g. Summer Open 2026" required />
        </Field>
        <Field label="Location / Venue *">
          <input style={inputStyle} value={form.location ?? ''} onChange={set('location')} placeholder="e.g. Ace Arena, Nairobi" required />
        </Field>
        <Field label="Tournament Start *">
          <input style={inputStyle} type="datetime-local" value={form.startDate ?? ''} onChange={set('startDate')} required />
        </Field>
        <Field label="Tournament End *">
          <input style={inputStyle} type="datetime-local" value={form.endDate ?? ''} onChange={set('endDate')} required />
        </Field>
        <Field label="Contact Email *">
          <select 
            style={{ ...selectStyle, marginBottom: '8px' }} 
            value={contactEmailType} 
            onChange={(e) => setContactEmailType(e.target.value as 'default' | 'custom')}
          >
            <option value="default">Default Host Email ({t.host?.email})</option>
            <option value="custom">Custom Email...</option>
          </select>
          {contactEmailType === 'custom' && (
            <input style={inputStyle} type="email" value={form.contactEmail ?? ''} onChange={set('contactEmail')} placeholder="organiser@tennis.com" required />
          )}
        </Field>
        <Field label="Contact Phone *">
          <input style={inputStyle} value={form.contactPhone ?? ''} onChange={set('contactPhone')} placeholder="+254 700 000 000" required />
        </Field>
      </Section>

      <Section title="Registration & Categories" color="#d29922">
        <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'block' }}>
            Categories *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {DEFAULT_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid', cursor: 'pointer',
                  background: categories.includes(cat) ? '#1f6feb' : '#0d1117',
                  borderColor: categories.includes(cat) ? '#58a6ff' : 'rgba(255,255,255,0.1)',
                  color: categories.includes(cat) ? '#fff' : '#8b949e',
                }}
              >
                {cat}
              </button>
            ))}
            {categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #58a6ff', cursor: 'pointer',
                  background: '#1f6feb', color: '#fff',
                }}
              >
                {cat}
              </button>
            ))}
            {!showOtherCategory ? (
              <button
                type="button"
                onClick={() => setShowOtherCategory(true)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer',
                  background: '#0d1117', color: '#8b949e',
                }}
              >
                + Other
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Custom Category"
                  style={{ ...inputStyle, width: '150px', padding: '6px 12px', borderRadius: '20px' }}
                  autoFocus
                />
                <button type="button" onClick={addCustomCategory} style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Add</button>
                <button type="button" onClick={() => setShowOtherCategory(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        <Field label="Allow Multi-Category Registration *">
          <select style={selectStyle} value={form.allowMultiCategory ?? 'false'} onChange={set('allowMultiCategory')}>
            <option value="false">No (Single Category Only)</option>
            <option value="true">Yes (Multiple Categories Allowed)</option>
          </select>
        </Field>

        <Field label="Registration Fee *">
          <input style={inputStyle} type="number" value={form.registrationFee ?? ''} onChange={set('registrationFee')} placeholder="e.g. 50" min={0} required />
        </Field>

        <Field label="Registration Start Date & Time *">
          <input style={inputStyle} type="datetime-local" value={form.registrationStart ?? ''} onChange={set('registrationStart')} required />
        </Field>
        
        <Field label="Registration End Date & Time *">
          <input style={inputStyle} type="datetime-local" value={form.registrationEnd ?? ''} onChange={set('registrationEnd')} required />
        </Field>

        <Field label="Max Teams" hint="Leave blank for unlimited">
          <input style={inputStyle} type="number" value={form.maxTeams ?? ''} onChange={set('maxTeams')} placeholder="32" min={2} max={512} />
        </Field>
      </Section>

      <Section title="Format & Scoring Rules" color="#3fb950">
        <Field label="Format Type *">
          <select style={selectStyle} value={form.formatType ?? ''} onChange={set('formatType')} required>
            <option value="Round Robin">Round Robin</option>
            <option value="Knockout">Knockout</option>
            <option value="Pool + Knockout">Pool + Knockout</option>
          </select>
        </Field>
        
        <Field label="Surface Type *">
          <select style={selectStyle} value={form.surfaceType ?? ''} onChange={set('surfaceType')} required>
            <option value="">Select surface...</option>
            <option value="Hard">Hard Court</option>
            <option value="Clay">Clay</option>
            <option value="Grass">Grass</option>
            <option value="Carpet">Carpet / Indoor</option>
          </select>
        </Field>
        
        <Field label="Match Duration (minutes)" hint="Max time per match before tiebreak">
          <input style={inputStyle} type="number" value={form.matchDuration ?? ''} onChange={set('matchDuration')} placeholder="Optional" />
        </Field>

        <div style={{ gridColumn: '1 / -1', background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '24px', marginTop: '12px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 600, color: '#c9d1d9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scoring Configurator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Field label="Sets to Win">
              <select name="setsToWin" value={scoringRules.setsToWin} onChange={handleScoringChange} style={selectStyle}>
                <option value="1">1 Set</option>
                <option value="2">2 Sets (Best of 3)</option>
                <option value="3">3 Sets (Best of 5)</option>
              </select>
            </Field>
            <Field label="Games per Set">
              <select name="gamesPerSet" value={scoringRules.gamesPerSet} onChange={handleScoringChange} style={selectStyle}>
                <option value="4">4 Games (Fast4)</option>
                <option value="6">6 Games</option>
                <option value="8">8 Games (Pro Set)</option>
              </select>
            </Field>
            <Field label="Tiebreak At">
              <select name="tiebreakAt" value={scoringRules.tiebreakAt} onChange={handleScoringChange} style={selectStyle}>
                <option value="3">3-3</option>
                <option value="4">4-4</option>
                <option value="5">5-5</option>
                <option value="6">6-6</option>
                <option value="8">8-8</option>
              </select>
            </Field>
            <Field label="Advantage Rules">
              <select name="advantage" value={scoringRules.advantage} onChange={handleScoringChange} style={selectStyle}>
                <option value="Standard">Standard (Ad)</option>
                <option value="No-Ad">No-Ad</option>
              </select>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Participant Management" color="#f85149">
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ color: '#8b949e', marginBottom: '16px', fontSize: '0.9rem' }}>
            Manage exceptions for active players. Marking a player as Withdrawn or Disqualified will automatically award Walkovers for their pending pool matches.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {t.teams?.map((team: any) => (
              <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161b22', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: team.status !== 'ACTIVE' ? '#8b949e' : '#fff' }}>
                    {team.franchiseName}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Categories: {team.categories}</span>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                      background: team.status === 'ACTIVE' ? '#23863622' : '#f8514922',
                      color: team.status === 'ACTIVE' ? '#3fb950' : '#ff7b72'
                    }}>
                      {team.status}
                    </span>
                  </div>
                </div>
                
                {team.status === 'ACTIVE' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleUpdateTeamStatus(team.id, 'WITHDRAWN')}
                      style={{ background: '#3b1c1c', color: '#ff7b72', border: '1px solid #f85149', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Withdraw
                    </button>
                    <button 
                      onClick={() => handleUpdateTeamStatus(team.id, 'DISQUALIFIED')}
                      style={{ background: '#3b1c1c', color: '#ff7b72', border: '1px solid #f85149', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Disqualify
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {(!t.teams || t.teams.length === 0) && (
              <div style={{ color: '#8b949e', textAlign: 'center', padding: '24px' }}>No teams registered yet.</div>
            )}
          </div>
        </div>
      </Section>

      <Section title="Branding" color="#bc8cff">
        <Field label="Tournament Flyer / Logo URL" hint="Upload flyer image or paste public URL">
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={inputStyle} value={form.logoUrl ?? ''} onChange={set('logoUrl')} placeholder="https://..." />
            <label style={{
              background: '#21262d', border: '1px solid rgba(255,255,255,0.1)', color: '#c9d1d9',
              borderRadius: '6px', padding: '10px 14px', cursor: uploadingFlyer ? 'wait' : 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', minWidth: '80px', justifyContent: 'center'
            }}>
              {uploadingFlyer ? '...' : 'Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingFlyer} onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadingFlyer(true);
                  // Mock storage upload
                  setTimeout(() => {
                    setForm(p => ({ ...p, logoUrl: `https://mockstorage.sports.tmsavannah.com/flyers/${e.target.files![0].name}` }));
                    setUploadingFlyer(false);
                  }, 1200);
                }
              }} />
            </label>
          </div>
        </Field>
        <Field label="Sponsor URL" hint="Link to primary sponsor page">
          <input style={inputStyle} value={form.sponsorUrl ?? ''} onChange={set('sponsorUrl')} placeholder="https://..." />
        </Field>
      </Section>

      {/* Sticky bottom save bar */}
      <div style={{
        position: 'sticky', bottom: 0, background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: '12px',
        marginTop: '32px',
      }}>
        <button
          onClick={() => router.push(backPath)}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8b949e', borderRadius: '7px', padding: '9px 20px', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          style={{
            background: saveStatus === 'saved' ? '#238636' : saveStatus === 'error' ? '#b91c1c' : '#1f6feb',
            color: '#fff', border: 'none', borderRadius: '7px',
            padding: '9px 24px', fontSize: '0.875rem', fontWeight: 600,
            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            opacity: saveStatus === 'saving' ? 0.7 : 1, minWidth: '120px',
          }}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
