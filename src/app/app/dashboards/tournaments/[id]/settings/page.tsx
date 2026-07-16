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

export default function TournamentSettings({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/tournaments/${resolvedParams.id}`, fetcher);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form once data loads
  useEffect(() => {
    if (data?.tournament) {
      const t = data.tournament;
      setForm({
        name: t.name ?? '',
        location: t.location ?? '',
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        endDate: t.endDate ? t.endDate.split('T')[0] : '',
        formatType: t.formatType ?? '',
        scoringRules: t.scoringRules ?? '',
        matchDuration: t.matchDuration ? String(t.matchDuration) : '',
        surfaceType: t.surfaceType ?? '',
        maxTeams: t.maxTeams ? String(t.maxTeams) : '',
        categories: t.categories ?? '',
        registrationPhase: t.registrationPhase ?? 'CLOSED',
        logoUrl: t.logoUrl ?? '',
        sponsorUrl: t.sponsorUrl ?? '',
        contactEmail: t.contactEmail ?? '',
        contactPhone: t.contactPhone ?? '',
        prizeMoney: t.prizeMoney ?? '',
        globalState: t.globalState ?? 'NORMAL',
        globalMessage: t.globalMessage ?? '',
        isActive: t.isActive ? 'true' : 'false',
      });
    }
  }, [data]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMsg('');
    try {
      const payload = {
        ...form,
        isActive: form.isActive === 'true',
        maxTeams: form.maxTeams ? parseInt(form.maxTeams) : undefined,
        matchDuration: form.matchDuration ? parseInt(form.matchDuration) : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
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
        <Field label="Tournament Name">
          <input style={inputStyle} value={form.name ?? ''} onChange={set('name')} placeholder="e.g. Summer Open 2026" />
        </Field>
        <Field label="Location / Venue">
          <input style={inputStyle} value={form.location ?? ''} onChange={set('location')} placeholder="e.g. Ace Arena, Nairobi" />
        </Field>
        <Field label="Start Date">
          <input style={inputStyle} type="date" value={form.startDate ?? ''} onChange={set('startDate')} />
        </Field>
        <Field label="End Date">
          <input style={inputStyle} type="date" value={form.endDate ?? ''} onChange={set('endDate')} />
        </Field>
        <Field label="Contact Email">
          <input style={inputStyle} type="email" value={form.contactEmail ?? ''} onChange={set('contactEmail')} placeholder="organiser@tennis.com" />
        </Field>
        <Field label="Contact Phone">
          <input style={inputStyle} value={form.contactPhone ?? ''} onChange={set('contactPhone')} placeholder="+254 700 000 000" />
        </Field>
      </Section>

      <Section title="Format & Rules" color="#3fb950">
        <Field label="Format Type">
          <select style={selectStyle} value={form.formatType ?? ''} onChange={set('formatType')}>
            <option value="Round-Robin">Round Robin</option>
            <option value="Fast4">Fast4</option>
            <option value="Knockout">Knockout</option>
            <option value="Pool + Knockout">Pool + Knockout</option>
            <option value="Standard">Standard</option>
          </select>
        </Field>
        <Field label="Surface Type">
          <select style={selectStyle} value={form.surfaceType ?? ''} onChange={set('surfaceType')}>
            <option value="">Select surface...</option>
            <option value="Hard">Hard Court</option>
            <option value="Clay">Clay</option>
            <option value="Grass">Grass</option>
            <option value="Carpet">Carpet / Indoor</option>
          </select>
        </Field>
        <Field label="Match Duration (minutes)" hint="Max time per match before tiebreak">
          <input style={inputStyle} type="number" value={form.matchDuration ?? ''} onChange={set('matchDuration')} placeholder="90" min={15} max={300} />
        </Field>
        <Field label="Scoring Rules">
          <input style={inputStyle} value={form.scoringRules ?? ''} onChange={set('scoringRules')} placeholder="e.g. Best of 3 sets, no-ad" />
        </Field>
        <Field label="Prize Money" hint="Total prize pool (narrative, e.g. KES 50,000)">
          <input style={inputStyle} value={form.prizeMoney ?? ''} onChange={set('prizeMoney')} placeholder="KES 50,000" />
        </Field>
      </Section>

      <Section title="Registration" color="#d29922">
        <Field label="Max Teams">
          <input style={inputStyle} type="number" value={form.maxTeams ?? ''} onChange={set('maxTeams')} placeholder="32" min={2} max={512} />
        </Field>
        <Field label="Registration Phase">
          <select style={selectStyle} value={form.registrationPhase ?? 'CLOSED'} onChange={set('registrationPhase')}>
            <option value="CLOSED">Closed</option>
            <option value="EARLY">Early Bird</option>
            <option value="LATE">Late Registration</option>
          </select>
        </Field>
        <Field label="Categories" hint="Comma-separated e.g. Men's Singles, Women's Doubles">
          <input style={inputStyle} value={form.categories ?? ''} onChange={set('categories')} placeholder="Men's Singles, Women's Singles, Mixed Doubles" />
        </Field>
      </Section>

      <Section title="Branding" color="#bc8cff">
        <Field label="Logo URL" hint="Public URL for tournament logo">
          <input style={inputStyle} value={form.logoUrl ?? ''} onChange={set('logoUrl')} placeholder="https://..." />
        </Field>
        <Field label="Sponsor URL" hint="Link to primary sponsor page">
          <input style={inputStyle} value={form.sponsorUrl ?? ''} onChange={set('sponsorUrl')} placeholder="https://..." />
        </Field>
      </Section>

      <Section title="Status & Control" color="#f85149">
        <Field label="Tournament Active">
          <select style={selectStyle} value={form.isActive ?? 'false'} onChange={set('isActive')}>
            <option value="false">Draft (not active)</option>
            <option value="true">Active (live)</option>
          </select>
        </Field>
        <Field label="Global State">
          <select style={selectStyle} value={form.globalState ?? 'NORMAL'} onChange={set('globalState')}>
            <option value="NORMAL">Normal</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </Field>
        <Field label="Global Broadcast Message" hint="Shown to all participants when set">
          <input style={inputStyle} value={form.globalMessage ?? ''} onChange={set('globalMessage')} placeholder="Optional emergency or info message..." />
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
