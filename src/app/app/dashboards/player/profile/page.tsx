'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, Smartphone, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PlayerProfileSettings() {
  const { data, error, isLoading } = useSWR('/api/player/dashboard', fetcher);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    setIsSandbox(localStorage.getItem('ENABLE_SANDBOX') === 'true');
  }, []);

  if (isLoading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading Profile...</div>;
  if (error || !data?.success) return <div style={{ padding: '40px', color: '#f85149' }}>Failed to load profile. Are you logged in?</div>;

  const { user } = data;
  const badges: string[] = Array.isArray(user.badges)
    ? user.badges
    : (() => { try { return JSON.parse(user.badges); } catch { return []; } })();

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#000' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', color: '#fff' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} color="gold" /> Trust Score: {user.trustScore || 100}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} color="var(--primary)" /> Lvl {Math.floor((user.globalXp || 0) / 100) + 1}</span>
            </div>
          </div>
        </div>
        <Link href="/app/dashboards/player">
          <DynamicButton variant="secondary">Back to Dashboard</DynamicButton>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Stats & Gamification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={24} color="var(--primary)" />
              Achievements
            </h2>
            <Card style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff' }}>{user.globalXp || 0}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>XP Total</span>
              </div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Badge Showcase</h3>
              {badges.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No badges earned yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {badges.map((badge, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Medal size={20} color="gold" />
                      <span style={{ color: '#fff', fontWeight: 500 }}>{badge}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={24} color="var(--primary)" />
              Linked Devices
            </h2>
            <Card style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(63, 185, 80, 0.2)', padding: '12px', borderRadius: '50%' }}>
                    <Smartphone size={24} color="#3fb950" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff' }}>iPhone 15 Pro</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Now • Tennis Suite App</span>
                  </div>
                </div>
                <CheckCircle2 color="#3fb950" />
              </div>
              <DynamicButton variant="secondary" style={{ width: '100%' }}>Link New Device</DynamicButton>
            </Card>
          </section>

        </div>

        {/* Right Column: Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={24} color="var(--primary)" />
              Preferences
            </h2>
            <Card style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Push Notifications</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Receive alerts for upcoming matches and draws.</p>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  style={{ 
                    width: '50px', height: '26px', borderRadius: '13px', background: notificationsEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.2)', 
                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <motion.div 
                    layout 
                    initial={false}
                    animate={{ x: notificationsEnabled ? 24 : 2 }}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px' }}
                  />
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Developer Sandbox</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enable mock data for testing scenarios.</p>
                </div>
                <button 
                  onClick={() => {
                    const next = !isSandbox;
                    setIsSandbox(next);
                    localStorage.setItem('ENABLE_SANDBOX', next ? 'true' : 'false');
                    window.dispatchEvent(new Event('storage')); // Trigger update across tabs
                  }}
                  style={{ 
                    width: '50px', height: '26px', borderRadius: '13px', background: isSandbox ? '#d2a8ff' : 'rgba(255,255,255,0.2)', 
                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <motion.div 
                    layout 
                    initial={false}
                    animate={{ x: isSandbox ? 24 : 2 }}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px' }}
                  />
                </button>
              </div>

            </Card>
          </section>

          <section>
            <DynamicButton variant="secondary" style={{ width: '100%', color: '#f85149', borderColor: 'rgba(248,81,73,0.3)' }}>
              <LogOut size={18} style={{ marginRight: '8px' }} />
              Log Out
            </DynamicButton>
          </section>

        </div>
      </div>
    </div>
  );
}
