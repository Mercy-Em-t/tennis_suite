'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import TournamentFactory from '@/components/tennis/TournamentFactory';
import styles from './admin.module.css';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GlobalHostDashboard() {
  const router = useRouter();
  const { data, error, mutate } = useSWR('/api/tournaments', fetcher);
  const [isCreating, setIsCreating] = useState(false);

  if (!data && !error) {
    return <div className={styles.loadingState}>Loading Host Command...</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tournaments: any[] = data?.tournaments ?? [];
  const activeCount  = tournaments.filter((t: any) => t.isActive).length;
  const totalTeams   = tournaments.reduce((acc: number, t: any) => acc + (t._count?.teams ?? 0), 0);
  const totalMatches = tournaments.reduce((acc: number, t: any) => acc + (t._count?.matches ?? 0), 0);

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Host Control Center</h1>
          <p className={styles.pageSubtitle}>Manage your localized operations</p>
        </div>
        <div className={styles.headerActions}>
          <a className={styles.validationLink} href="/validation">
            Validation Sandbox ↗
          </a>
          <Button
            variant="primary"
            onClick={() => setIsCreating(v => !v)}
          >
            {isCreating ? 'Cancel' : '+ New Tournament'}
          </Button>
        </div>
      </header>

      {/* ── Stat Bar ── */}
      <div className={styles.statBar}>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{activeCount}</span>
            <span className={styles.statDesc}>Active Tournaments</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{totalTeams}</span>
            <span className={styles.statDesc}>Registered Franchises</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statIcon}>🎾</div>
          <div className={styles.statInfo}>
            <span className={styles.statNum}>{totalMatches}</span>
            <span className={styles.statDesc}>Total Matches</span>
          </div>
        </div>
      </div>

      {/* ── Create Tournament Wizard ── */}
      <AnimatePresence>
        {isCreating && (
          <TournamentFactory onClose={() => setIsCreating(false)} />
        )}
      </AnimatePresence>

      {/* ── Tournament Grid ── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Tournaments</h2>
      </div>

      <div className={styles.tournamentGrid}>
        {tournaments.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏟️</div>
            <h3 className={styles.emptyTitle}>No active tournament</h3>
            <p className={styles.emptyDesc}>
              You do not have any active tournaments. Click <strong>+ New Tournament</strong> above to create a new tournament.
            </p>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              Create Tournament
            </Button>
          </div>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {tournaments.map((t: any, i: number) => {
          const fillPct = t.maxTeams > 0
            ? Math.round(((t._count?.teams ?? 0) / t.maxTeams) * 100)
            : 0;

          return (
            <motion.div
              key={t.id}
              className={styles.tournamentCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTopRow}>
                  {t.isArchived ? (
                    <Badge variant="secondary">Past</Badge>
                  ) : t.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="warning">Draft</Badge>
                  )}
                  <span className={styles.formatChip}>{t.formatType}</span>
                </div>

                <h2 className={styles.tournamentName}>{t.name}</h2>

                {/* Fill bar */}
                <div className={styles.fillBarSection}>
                  <div className={styles.fillBarLabel}>
                    <span className={styles.fillBarText}>Franchises</span>
                    <span className={styles.fillBarCount}>
                      {t._count?.teams ?? 0} / {t.maxTeams}
                    </span>
                  </div>
                  <div className={styles.fillBarTrack}>
                    <div
                      className={styles.fillBarFill}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.cardStat}>
                    <span className={styles.cardStatValue}>{t._count?.matches ?? 0}</span>
                    <span className={styles.cardStatLabel}>Matches</span>
                  </div>
                  {t._count?.courts !== undefined && (
                    <div className={styles.cardStat}>
                      <span className={styles.cardStatValue}>{t._count.courts}</span>
                      <span className={styles.cardStatLabel}>Courts</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/tournaments/${t.id}`)}
                >
                  Manage →
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
