'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TournamentFactory.module.css';

interface TournamentFactoryProps {
  onClose: () => void;
}

export default function TournamentFactory({ onClose }: TournamentFactoryProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    formatType: 'Round-Robin',
    matchDuration: '60',
    scoringRules: 'Advantage',
    categories: '',
    numCourts: '1',
    surfaceType: 'Hard',
    logoUrl: '',
    sponsorUrl: ''
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        // Redirection to the new dashboard
        router.push(`/tournaments/${data.tournament.id}`);
      } else {
        alert(data.error || 'Failed to provision tournament');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during provisioning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const capacity = Math.floor((parseInt(formData.numCourts) || 0) * 2 / ((parseInt(formData.matchDuration) || 60) / 60));

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Tournament Factory</h2>
          <div className={styles.steps}>
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`${styles.stepIndicator} ${step === s ? styles.active : ''} ${step > s ? styles.completed : ''}`} 
              />
            ))}
          </div>
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <div>
              <h3 className={styles.stepTitle}>1. Identity</h3>
              <div className={styles.formGroup}>
                <label>Tournament Name</label>
                <input className={styles.input} name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Summer Slam 2026" />
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input className={styles.input} type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input className={styles.input} type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Location / Venue Name</label>
                <input className={styles.input} name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Central Park Tennis Center" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className={styles.stepTitle}>2. Structure</h3>
              <div className={styles.formGroup}>
                <label>Format Type</label>
                <select className={styles.input} name="formatType" value={formData.formatType} onChange={handleChange}>
                  <option value="Round-Robin">Round-Robin</option>
                  <option value="Elimination">Elimination</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Categories</label>
                <input className={styles.input} name="categories" value={formData.categories} onChange={handleChange} placeholder="e.g. Men's Singles, Women's Doubles" />
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Match Duration (minutes)</label>
                  <input className={styles.input} type="number" name="matchDuration" value={formData.matchDuration} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Scoring Rules</label>
                  <select className={styles.input} name="scoringRules" value={formData.scoringRules} onChange={handleChange}>
                    <option value="Advantage">Advantage</option>
                    <option value="No-Ad">No-Ad</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className={styles.stepTitle}>3. Infrastructure</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Number of Courts</label>
                  <input className={styles.input} type="number" min="1" name="numCourts" value={formData.numCourts} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Surface Type</label>
                  <select className={styles.input} name="surfaceType" value={formData.surfaceType} onChange={handleChange}>
                    <option value="Hard">Hard Court</option>
                    <option value="Clay">Clay</option>
                    <option value="Grass">Grass</option>
                  </select>
                </div>
              </div>
              <div className={styles.capacityPreview}>
                <span>Simultaneous Match Capacity</span>
                <strong>{isNaN(capacity) ? 0 : capacity} players/hr</strong>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className={styles.stepTitle}>4. Branding</h3>
              <div className={styles.formGroup}>
                <label>Logo URL (Optional)</label>
                <input className={styles.input} name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className={styles.formGroup}>
                <label>Sponsor URL (Optional)</label>
                <input className={styles.input} name="sponsorUrl" value={formData.sponsorUrl} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={step === 1 ? onClose : handlePrev}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button className={styles.nextBtn} onClick={handleNext}>Next</button>
          ) : (
            <button className={styles.launchBtn} onClick={handleLaunch} disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning courts and starting tournament...' : 'Launch'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
