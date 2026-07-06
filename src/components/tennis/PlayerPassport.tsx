'use client';

import React, { useState } from 'react';
import { User } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Settings, Share2, Calendar, Phone, Award, Shield, Activity } from 'lucide-react';
import styles from './PlayerPassport.module.css';

interface PlayerPassportProps {
  user: User;
  isOwner: boolean;
}

export const PlayerPassport: React.FC<PlayerPassportProps> = ({ user, isOwner }) => {
  const [view, setView] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [availabilityStr, setAvailabilityStr] = useState(user.availability || '{}');
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');

  // Radar chart data based on user stats, or placeholder if none
  const radarData = [
    { subject: 'Power', A: 80, fullMark: 100 },
    { subject: 'Speed', A: 65, fullMark: 100 },
    { subject: 'Stamina', A: 90, fullMark: 100 },
    { subject: 'Technique', A: 75, fullMark: 100 },
    { subject: 'Tactics', A: 85, fullMark: 100 },
    { subject: 'Mental', A: 70, fullMark: 100 },
  ];

  const handleSavePrivateInfo = () => {
    // In a real app, this would be an API call to update the User
    console.log("Saving...", { availabilityStr, emergencyContact });
    alert("Profile saved successfully!");
  };

  return (
    <div className={styles.container}>
      
      {/* Header - Identity */}
      <Card glass className={styles.headerCard}>
        <div className={styles.headerActions}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => window.location.href = '/team'}>
              Back to Hub
            </Button>
            {isOwner && (
              <Button 
                variant="secondary"
                onClick={() => setView(view === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Settings size={16} />
                <span>{view === 'PUBLIC' ? 'Edit Profile' : 'View Public'}</span>
              </Button>
            )}
          </div>
          <Button variant="secondary" style={{ padding: '0 0.5rem' }}>
            <Share2 size={16} color="#22d3ee" />
          </Button>
        </div>

        <div className={styles.headerLayout}>
          <div className={styles.avatarWrapper}>
            {/* Avatar Frame based on trustScore/xp */}
            <div className={styles.avatarFrame}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarFallback}>{user.name.charAt(0)}</span>
              )}
            </div>
            <div className={styles.shieldBadge}>
              <Shield size={20} />
            </div>
          </div>
          
          <div className={styles.headerText}>
            <h1 className={styles.playerName}>{user.name}</h1>
            <p className={styles.playerHandle}>{user.socialHandle || '@player'}</p>
            
            <div className={styles.badgeGroup}>
              <Badge variant="accent">Level {user.skillLevel || '4.0'}</Badge>
              <Badge variant="default">{user.playstyle || 'All-Court'}</Badge>
              <Badge variant="success">Trust: {user.trustScore}%</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Body */}
      {view === 'PUBLIC' ? (
        <div className={styles.bodyGrid}>
          <Card glass className={styles.cardSection}>
            <h3 className={styles.sectionTitle}>
              <Activity size={20} className={styles.sectionTitleIcon} />
              Performance Matrix
            </h3>
            <div className={styles.radarContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={user.name} dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.statsFooter}>
              <div>
                <div className={styles.statValue}>{(user.winRate * 100).toFixed(0)}%</div>
                <div className={styles.statLabel}>Win Rate</div>
              </div>
              <div>
                <div className={styles.statValue}>{user.globalXp}</div>
                <div className={styles.statLabel}>Global XP</div>
              </div>
            </div>
          </Card>

          <Card glass className={styles.cardSection}>
            <h3 className={styles.sectionTitle}>
              <Award size={20} className={styles.sectionTitleIcon} />
              Tournament History
            </h3>
            <div className={styles.historyList}>
              {/* Placeholder history until we wire up match data */}
              <div className={styles.historyItem}>
                <div>
                  <h4 className={styles.historyTitle}>Summer Open '26</h4>
                  <p className={styles.historyDesc}>Quarter Finalist • Men's Singles</p>
                </div>
                <Badge variant="accent">+150 XP</Badge>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <h4 className={styles.historyTitle}>City Championship</h4>
                  <p className={styles.historyDesc}>Runner Up • Doubles</p>
                </div>
                <Badge variant="success">+300 XP</Badge>
              </div>
              <div className={styles.historyItem}>
                <div>
                  <h4 className={styles.historyTitle}>Spring League</h4>
                  <p className={styles.historyDesc}>Pool Stage</p>
                </div>
                <Badge variant="default">+50 XP</Badge>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className={styles.bodyGrid} style={{ gridTemplateColumns: '1fr' }}>
          <Card glass className={styles.cardSection}>
            <h3 className={styles.sectionTitle}>
              <Settings size={20} className={styles.sectionTitleIcon} />
              Private Settings
            </h3>
            
            <div className={styles.settingsForm}>
              <div className={styles.inputGroup}>
                <label>
                  <Phone size={16} />
                  Emergency Contact
                </label>
                <input 
                  type="text" 
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Name and Phone Number"
                />
                <p className={styles.inputHint}>Required for physical safety during official events.</p>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <Settings size={16} />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={user.email || ''}
                  disabled
                  placeholder="player@example.com"
                />
                <p className={styles.inputHint}>Your registered email address (cannot be changed here).</p>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <Calendar size={16} />
                  Availability (JSON)
                </label>
                <textarea 
                  value={availabilityStr}
                  onChange={(e) => setAvailabilityStr(e.target.value)}
                  placeholder='{"monday": ["18:00", "22:00"]}'
                />
                <p className={styles.inputHint}>Used for automated scheduling in leagues and tournaments.</p>
              </div>

              <div className={styles.formActions}>
                <Button variant="primary" onClick={handleSavePrivateInfo}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
