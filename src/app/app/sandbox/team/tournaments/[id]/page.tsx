'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Info, Trophy, Users, AlertCircle, BarChart3, Share2, Calendar, Swords, Medal } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DynamicButton } from '@/components/ui/DynamicButton';

type TabType = 'MATCH_HUB' | 'DRAWS_POOLS' | 'PERFORMANCE' | 'SOCIAL';

export default function PlayerSpecificTournamentSandbox({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>('MATCH_HUB');
  const tournamentName = params.id === 'summer-smash' ? 'Summer Smash 2026' : 'Winter Classic 2025';
  
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Navigation & Header ── */}
      <div>
        <Link href="/sandbox/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px 0', background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              {tournamentName}
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <StatusBadge status="LIVE">IN PROGRESS</StatusBadge>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <MapPin size={16} /> Center Court Complex
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Users size={16} /> Playing as: The Net Ninjas
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <DynamicButton variant="outline" style={{ display: 'flex', gap: '8px' }}>
              <Info size={16} /> Tournament Info
            </DynamicButton>
            <div style={{ textAlign: 'right', paddingLeft: '16px', borderLeft: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Rank</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>#4 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 16</span></div>
            </div>
          </div>
        </motion.header>
      </div>

      {/* ── 4 Domains Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
        {[
          { id: 'MATCH_HUB', label: 'Match Hub', icon: <Swords size={18} /> },
          { id: 'DRAWS_POOLS', label: 'Draws & Pools', icon: <Calendar size={18} /> },
          { id: 'PERFORMANCE', label: 'Performance', icon: <BarChart3 size={18} /> },
          { id: 'SOCIAL', label: 'Social & Media', icon: <Share2 size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '8px',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 0 20px rgba(88,166,255,0.4)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Dynamic Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'MATCH_HUB' && <MatchHubTab />}
          {activeTab === 'DRAWS_POOLS' && <DrawsPoolsTab />}
          {activeTab === 'PERFORMANCE' && <PerformanceTab />}
          {activeTab === 'SOCIAL' && <SocialTab />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

// ── TAB COMPONENTS ──

function MatchHubTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Next Match Banner with Check-In */}
        <motion.div 
          style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.15) 0%, rgba(88,166,255,0.02) 100%)', border: '1px solid rgba(88,166,255,0.4)', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <Trophy size={150} color="#58a6ff" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#58a6ff', fontWeight: 700, marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <AlertCircle size={18} /> Up Next: Quarter Finals
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '0 0 8px 0' }}>The Net Ninjas <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs</span> Baseline Ballers</h2>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Est. Start: 2:30 PM</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Court 2</span>
              </div>
            </div>
          </div>
          
          <DynamicButton variant="primary" style={{ fontSize: '1.1rem', padding: '12px 32px', background: '#3fb950', color: '#000', borderColor: '#3fb950', boxShadow: '0 0 15px rgba(63,185,80,0.4)' }}>
            Check In to Match
          </DynamicButton>
        </motion.div>

        {/* Filterable Match List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>Match Schedule</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Ready', 'Played'].map(f => (
                <span key={f} style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', background: f === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: f === 'All' ? '#000' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Played Match */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '16px 20px', borderRadius: '12px', cursor: 'pointer' }} className="hover:border-primary/50 transition-colors">
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Round of 16 • Played</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>vs. The Spin Doctors</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#3fb950', fontWeight: 800, fontSize: '1.2rem' }}>WIN</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>6-4, 7-6 (5)</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <motion.div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--card-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <Info size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            Checking in confirms your team is at the venue. Failure to check in 15 minutes prior to match time may result in a walkover.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function DrawsPoolsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <DynamicButton variant="primary">My Pool</DynamicButton>
        <DynamicButton variant="outline">Overall Draw (Knockout)</DynamicButton>
      </div>

      {/* Pool Standings */}
      <section>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '16px', fontWeight: 700 }}>Pool B Standings</h3>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px', fontWeight: 600 }}>Pos</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Team</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>P</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>W</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>L</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Pts</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.95rem' }}>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(88,166,255,0.1)' }}>
                <td style={{ padding: '16px', fontWeight: 800, color: '#fff' }}>1</td>
                <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>The Net Ninjas</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>3</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>3</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>0</td>
                <td style={{ padding: '16px', fontWeight: 800, color: '#58a6ff' }}>9</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>2</td>
                <td style={{ padding: '16px', color: '#fff' }}>Volley Llamas</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>3</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>2</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>1</td>
                <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bracket Preview Placeholder */}
      <section>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--card-border)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' }}>
          <Trophy size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>Interactive SVG Bracket</h3>
          <p style={{ color: 'var(--text-muted)' }}>This area will render the D3/SVG knockout bracket visualizer.</p>
        </div>
      </section>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Win Rate</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>100<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>%</span></div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Sets Won / Lost</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#3fb950' }}>6 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/</span> <span style={{ color: '#f85149' }}>0</span></div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Global Ranking</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)' }}>#42</div>
      </div>
    </div>
  );
}

function SocialTab() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--card-border)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' }}>
      <Share2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
      <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>Social & Highlights</h3>
      <p style={{ color: 'var(--text-muted)' }}>Shareable match stat cards and automated highlights will appear here.</p>
    </div>
  );
}
