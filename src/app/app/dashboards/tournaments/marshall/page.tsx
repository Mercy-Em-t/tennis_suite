'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './marshall.module.css';

/* ─── Types ─── */
interface Court {
  id: string;
  name: string;
  status: 'IN_USE' | 'AVAILABLE' | 'MAINTENANCE';
  teamA: string | null;
  teamB: string | null;
  durationMin: number;
  referee: string | null;
}

interface Dispute {
  id: string;
  matchId: string;
  teams: string;
  court: string;
  reason: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

/* ─── Mock data (UI-first; wired to /api/tournaments for courts in follow-up) ─── */
const MOCK_COURTS = [
  {
    id: '1',
    name: 'Centre Court',
    status: 'IN_USE',
    teamA: 'Baseline Bashers',
    teamB: 'Topspin Titans',
    durationMin: 42,
    referee: 'Alex R.',
  },
  {
    id: '2',
    name: 'Court 2',
    status: 'AVAILABLE',
    teamA: null,
    teamB: null,
    durationMin: 0,
    referee: null,
  },
  {
    id: '3',
    name: 'Court 3',
    status: 'IN_USE',
    teamA: 'Net Crushers',
    teamB: 'Rally Kings',
    durationMin: 18,
    referee: 'Jordan M.',
  },
  {
    id: '4',
    name: 'Court 4',
    status: 'MAINTENANCE',
    teamA: null,
    teamB: null,
    durationMin: 0,
    referee: null,
  },
];

const MOCK_DISPUTES = [
  { id: 'd1', matchId: 'match_001', teams: 'Baseline Bashers vs Topspin Titans', court: 'Centre Court', reason: 'Score correction requested' },
  { id: 'd2', matchId: 'match_003', teams: 'Ace Factory vs Drop Shot Duos', court: 'Court 3', reason: 'Line call disputed — Point 3, Game 5' },
];

const MOCK_STAFF = [
  { id: 's1', name: 'James T.', role: 'BALL_BOY', assignment: 'Centre Court' },
  { id: 's2', name: 'Sarah L.', role: 'BALL_BOY', assignment: null },
  { id: 's3', name: 'Omar K.', role: 'CONCIERGE', assignment: 'Court 3' },
  { id: 's4', name: 'Priya N.', role: 'CONCIERGE', assignment: null },
];

const REFEREES = ['Unassigned', 'Alex R.', 'Jordan M.', 'Sam B.', 'Tasha F.'];

export default function MarshallDashboard() {
  const { data, error, isLoading } = useSWR('/api/tournaments/active', fetcher, { refreshInterval: 5000 });

  const apiCourts: Court[] = React.useMemo(() => {
    if (!data?.tournament?.courts) return MOCK_COURTS as Court[];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.tournament.courts.map((c: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeMatch = data.tournament.matches.find((m: any) => 
        m.courtId === c.id && (m.status === 'IN_PROGRESS' || m.status === 'SCHEDULED')
      );
      
      const teamA = activeMatch?.teamA?.franchiseName || null;
      const teamB = activeMatch?.teamB?.franchiseName || null;
      const status = activeMatch?.status === 'IN_PROGRESS' ? 'IN_USE' : c.courtType === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE';
      const durationMin = activeMatch ? Math.floor(activeMatch.durationSec / 60) : 0;
      
      return {
        id: c.id,
        name: c.name,
        status,
        teamA,
        teamB,
        durationMin,
        referee: 'Unassigned',
      };
    });
  }, [data]);

  const [courts, setCourts] = useState<Court[]>(MOCK_COURTS as Court[]);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);

  useEffect(() => {
    setCourts(apiCourts);
  }, [apiCourts]);

  const activeCourts  = courts.filter(c => c.status === 'IN_USE').length;
  const availableCourts = courts.filter(c => c.status === 'AVAILABLE').length;
  const activeDisputes = disputes.length;
  const staffCount    = MOCK_STAFF.length;

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  const handleResolve = (disputeId: string) => {
    setDisputes(prev => prev.filter(d => d.id !== disputeId));
  };

  const handleRefereeChange = (courtId: string, referee: string) => {
    setCourts(prev => prev.map(c =>
      c.id === courtId ? { ...c, referee: referee === 'Unassigned' ? null : referee } : c
    ));
  };

  const statusClass = (status: string) => {
    if (status === 'IN_USE') return styles.inUse;
    if (status === 'MAINTENANCE') return styles.maintenance;
    return styles.available;
  };

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Marshall Command</h1>
          <p className={styles.pageSubtitle}>Venue operations · Court assignment · Dispute resolution</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ── Stat Bar ── */}
      <div className={styles.statBar}>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>🎾</div>
          <div>
            <span className={styles.statNum}>{activeCourts}</span>
            <span className={styles.statDesc}>Courts Live</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>✅</div>
          <div>
            <span className={styles.statNum}>{availableCourts}</span>
            <span className={styles.statDesc}>Courts Available</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>⚠️</div>
          <div>
            <span className={styles.statNum} style={{ color: activeDisputes > 0 ? '#f85149' : '#f0f6fc' }}>
              {activeDisputes}
            </span>
            <span className={styles.statDesc}>Open Disputes</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>👥</div>
          <div>
            <span className={styles.statNum}>{staffCount}</span>
            <span className={styles.statDesc}>On-Duty Staff</span>
          </div>
        </div>
      </div>

      {/* ── Court Grid ── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Live Court Grid</h2>
      </div>

      <div className={styles.courtGrid}>
        {courts.map((court, i) => (
          <motion.div
            key={court.id}
            className={styles.courtTile}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
          >
            <div className={styles.courtTileHeader}>
              <h3 className={styles.courtName}>{court.name}</h3>
              <span className={`${styles.courtStatusChip} ${statusClass(court.status)}`}>
                {court.status === 'IN_USE' ? 'Live' : court.status === 'MAINTENANCE' ? 'Maintenance' : 'Available'}
              </span>
            </div>

            <div className={styles.courtTileBody}>
              {court.teamA && court.teamB ? (
                <>
                  <p className={styles.courtMatchTeams}>
                    {court.teamA} <span className={styles.courtVs}>vs</span> {court.teamB}
                  </p>
                  <p className={styles.courtMatchTimer}>⏱ {court.durationMin} min elapsed</p>
                </>
              ) : (
                <p className={styles.courtEmpty}>
                  {court.status === 'MAINTENANCE' ? 'Court under maintenance' : 'No match assigned'}
                </p>
              )}
            </div>

            <div className={styles.courtTileFooter}>
              <span className={styles.courtAssignLabel}>Referee</span>
              <select
                className={styles.courtAssignSelect}
                value={court.referee ?? 'Unassigned'}
                onChange={e => handleRefereeChange(court.id, e.target.value)}
              >
                {REFEREES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Lower Grid: Disputes + Staff ── */}
      <div className={styles.lowerGrid}>

        {/* Disputes Queue */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Disputes Queue
              {disputes.length > 0 && (
                <span style={{ marginLeft: 10, fontSize: '0.8rem', color: '#f85149', fontWeight: 700 }}>
                  {disputes.length} open
                </span>
              )}
            </h2>
          </div>

          <div className={styles.disputeList}>
            <AnimatePresence>
              {disputes.length === 0 && (
                <motion.div
                  key="no-disputes"
                  className={styles.noDisputes}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✅ No active disputes — all clear.
                </motion.div>
              )}
              {disputes.map((d, i) => (
                <motion.div
                  key={d.id}
                  className={styles.disputeCard}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <div>
                    <p className={styles.disputeMatch}>{d.teams}</p>
                    <p className={styles.disputeMeta}>{d.court} · {d.reason}</p>
                  </div>
                  <button className={styles.resolveBtn} onClick={() => handleResolve(d.id)}>
                    Resolve →
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Staff Board */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Support Staff Board</h2>
          </div>

          <div className={styles.staffList}>
            {MOCK_STAFF.map((person, i) => (
              <motion.div
                key={person.id}
                className={styles.staffCard}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: i * 0.07 }}
              >
                <div className={styles.staffInfo}>
                  <span className={styles.staffName}>{person.name}</span>
                  <span className={styles.staffRole}>{person.role.replace('_', ' ')}</span>
                </div>
                {person.assignment
                  ? <span className={styles.staffAssignment}>{person.assignment}</span>
                  : <span className={styles.staffAssignmentUnassigned}>Unassigned</span>
                }
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
