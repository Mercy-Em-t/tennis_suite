'use client';

import React from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/* XP level thresholds (same as in Player Dashboard for consistency) */
const XP_LEVELS = [0, 100, 250, 500, 900, 1500, 2500];

function getXpLevel(xp: number) {
  let level = 1;
  for (let i = 1; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export default function LeaderboardsPage() {
  const { data, error, isLoading } = useSWR('/api/public/leaderboards', fetcher, { refreshInterval: 60000 });

  if (isLoading) return <div style={{ padding: '48px', color: '#8b949e', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Loading Leaderboards...</div>;
  if (error || !data?.success) return <div style={{ padding: '48px', color: '#f85149', textAlign: 'center', minHeight: '100vh', background: '#0d1117' }}>Failed to load leaderboards.</div>;

  const { leaderboard } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '64px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 16px', color: '#58a6ff' }}>Global Leaderboards</h1>
        <p style={{ color: '#8b949e', margin: 0, fontSize: '1.2rem', maxWidth: '600px', marginInline: 'auto' }}>
          The top ranked players across the entire Tennis Suite platform. Rise through the ranks by competing in tournaments and winning matches.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ padding: '48px 24px', maxWidth: '800px', margin: '0 auto' }}>
        
        {leaderboard.length === 0 ? (
          <p style={{ color: '#8b949e', textAlign: 'center' }}>No players found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaderboard.map((player: any, index: number) => {
              const level = getXpLevel(player.globalXp);
              let rankStyle = { color: '#8b949e', fontSize: '1.2rem', fontWeight: 700, width: '40px' };
              
              if (index === 0) rankStyle = { ...rankStyle, color: '#ffd700', fontSize: '1.8rem' }; // Gold
              else if (index === 1) rankStyle = { ...rankStyle, color: '#c0c0c0', fontSize: '1.5rem' }; // Silver
              else if (index === 2) rankStyle = { ...rankStyle, color: '#cd7f32', fontSize: '1.5rem' }; // Bronze

              const badges = Array.isArray(player.badges) 
                ? player.badges 
                : (() => { try { return JSON.parse(player.badges); } catch { return []; } })();

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card style={{ 
                    background: index < 3 ? 'rgba(22, 27, 34, 0.9)' : '#161b22', 
                    border: index === 0 ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(255,255,255,0.1)', 
                    padding: '16px 24px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '24px'
                  }}>
                    <div style={rankStyle}>#{index + 1}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: index === 0 ? '#ffd700' : '#fff' }}>{player.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>Level {level}</span>
                        {badges.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {badges.slice(0, 3).map((b: string, i: number) => (
                              <span key={i} title={b} style={{ fontSize: '1rem' }}>🏆</span> // Placeholder for badge emoji mapping
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#58a6ff' }}>{player.globalXp}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px' }}>XP</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
