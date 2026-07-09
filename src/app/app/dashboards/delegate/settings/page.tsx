'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OverrideConfirmationModal } from '@/components/director/OverrideConfirmationModal';

export default function SettingsPage() {
  const [scoringRule, setScoringRule] = useState('Standard (Best of 3, Ad-Scoring)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleConfirm = async (reason: string) => {
    setIsModalOpen(false);
    setIsSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/director/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tournamentId: 'global', // In a real scenario, this comes from a context or selector
          scoringRules: scoringRule,
          reason
        })
      });

      if (res.ok) {
        setSuccessMsg('Tournament configuration updated globally.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <Link href="/dashboards/delegate" style={{ color: '#22d3ee', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Command Center</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Recursive Settings Override</h1>
      <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Modify Tournament Factory settings mid-event. All changes trigger a Global Sync.</p>
      
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #10b981' }}>
          {successMsg}
        </div>
      )}

      <div style={{ background: '#1e1e24', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
        <h3 style={{ color: '#eab308', margin: '0 0 1rem 0' }}>Score Format Override</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>Temporarily change scoring format to speed up matches.</p>
        <select 
          value={scoringRule}
          onChange={(e) => setScoringRule(e.target.value)}
          style={{ background: '#111', color: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #444', width: '100%', maxWidth: '300px' }}
        >
          <option>Standard (Best of 3, Ad-Scoring)</option>
          <option>Fast4 (No-Ad, Tiebreak at 3-3)</option>
          <option>Pro Set (First to 8)</option>
        </select>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isSaving}
          style={{ display: 'block', marginTop: '1rem', background: '#eab308', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          {isSaving ? 'SYNCING...' : 'FORCE GLOBAL SYNC'}
        </button>
      </div>

      <OverrideConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Override Global Settings"
        description={`You are about to change the active scoring rules to: ${scoringRule}. This will apply to all future and un-started matches in the current tournament.`}
      />
    </div>
  );
}
