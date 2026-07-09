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
    <div >
      
      {/* ── Navigation & Header ── */}
      <div>
        <Link href="/sandbox/team" >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          
        >
          <div>
            <h1 >
              {tournamentName}
            </h1>
            <div >
              <StatusBadge status="warning">IN PROGRESS</StatusBadge>
              <span >
                <MapPin size={16} /> Center Court Complex
              </span>
              <span >
                <Users size={16} /> Playing as: The Net Ninjas
              </span>
            </div>
          </div>
          
          <div >
            <DynamicButton variant="secondary" >
              <Info size={16} /> Tournament Info
            </DynamicButton>
            <div >
              <span >Current Rank</span>
              <div >#4 <span >/ 16</span></div>
            </div>
          </div>
        </motion.header>
      </div>

      {/* ── 4 Domains Navigation Tabs ── */}
      <div >
        {[
          { id: 'MATCH_HUB', label: 'Match Hub', icon: <Swords size={18} /> },
          { id: 'DRAWS_POOLS', label: 'Draws & Pools', icon: <Calendar size={18} /> },
          { id: 'PERFORMANCE', label: 'Performance', icon: <BarChart3 size={18} /> },
          { id: 'SOCIAL', label: 'Social & Media', icon: <Share2 size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            
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
    <div >
      <div >
        
        {/* Next Match Banner with Check-In */}
        <motion.div 
          
        >
          <div >
            <Trophy size={150} color="#58a6ff" />
          </div>
          
          <div >
            <AlertCircle size={18} /> Up Next: Quarter Finals
          </div>
          
          <div >
            <div>
              <h2 >The Net Ninjas <span >vs</span> Baseline Ballers</h2>
              <div >
                <span ><Clock size={16} /> Est. Start: 2:30 PM</span>
                <span ><MapPin size={16} /> Court 2</span>
              </div>
            </div>
          </div>
          
          <DynamicButton variant="secondary" >
            Check In to Match
          </DynamicButton>
        </motion.div>

        {/* Filterable Match List */}
        <section>
          <div >
            <h3 >Match Schedule</h3>
            <div >
              {['All', 'Ready', 'Played'].map(f => (
                <span key={f} >{f}</span>
              ))}
            </div>
          </div>
          <div >
            {/* Played Match */}
            <div  className="hover:border-primary/50 transition-colors">
              <div>
                <div >Round of 16 • Played</div>
                <div >vs. The Spin Doctors</div>
              </div>
              <div >
                <div >WIN</div>
                <div >6-4, 7-6 (5)</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div >
        <motion.div >
          <Info size={32} color="var(--text-muted)"  />
          <p >
            Checking in confirms your team is at the venue. Failure to check in 15 minutes prior to match time may result in a walkover.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function DrawsPoolsTab() {
  return (
    <div >
      <div >
        <DynamicButton variant="secondary">My Pool</DynamicButton>
        <DynamicButton variant="secondary">Overall Draw (Knockout)</DynamicButton>
      </div>

      {/* Pool Standings */}
      <section>
        <h3 >Pool B Standings</h3>
        <div >
          <table >
            <thead>
              <tr >
                <th >Pos</th>
                <th >Team</th>
                <th >P</th>
                <th >W</th>
                <th >L</th>
                <th >Pts</th>
              </tr>
            </thead>
            <tbody >
              <tr >
                <td >1</td>
                <td >The Net Ninjas</td>
                <td >3</td>
                <td >3</td>
                <td >0</td>
                <td >9</td>
              </tr>
              <tr >
                <td >2</td>
                <td >Volley Llamas</td>
                <td >3</td>
                <td >2</td>
                <td >1</td>
                <td >6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bracket Preview Placeholder */}
      <section>
        <div >
          <Trophy size={48} color="var(--text-muted)"  />
          <h3 >Interactive SVG Bracket</h3>
          <p >This area will render the D3/SVG knockout bracket visualizer.</p>
        </div>
      </section>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div >
      <div >
        <div >Win Rate</div>
        <div >100<span >%</span></div>
      </div>
      <div >
        <div >Sets Won / Lost</div>
        <div >6 <span >/</span> <span >0</span></div>
      </div>
      <div >
        <div >Global Ranking</div>
        <div >#42</div>
      </div>
    </div>
  );
}

function SocialTab() {
  return (
    <div >
      <Share2 size={48} color="var(--text-muted)"  />
      <h3 >Social & Highlights</h3>
      <p >Shareable match stat cards and automated highlights will appear here.</p>
    </div>
  );
}
