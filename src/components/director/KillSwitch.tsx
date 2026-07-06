'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './KillSwitch.module.css';
import { AlertTriangle, Power, ShieldAlert } from 'lucide-react';
import { useTournamentContext } from '@/lib/context/TournamentContext';

export function KillSwitch() {
  const { activeTournamentId } = useTournamentContext();
  const [isHovered, setIsHovered] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isTriggered, setIsTriggered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reason, setReason] = useState('Weather Event');
  const [errorMsg, setErrorMsg] = useState('');
  
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Handle drag events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      
      const trackRect = trackRef.current.getBoundingClientRect();
      // Handle width is 48px, so track width is rect.width - 48
      const maxDrag = trackRect.width - 48; 
      
      let newX = e.clientX - trackRect.left - 24; // Center the handle
      
      if (newX < 0) newX = 0;
      if (newX > maxDrag) newX = maxDrag;
      
      const progress = newX / maxDrag;
      setDragProgress(progress);
      
      if (progress > 0.95 && !isSaving && !isTriggered) {
        // Trigger point
        isDragging.current = false;
        setDragProgress(1);
        setIsSaving(true);
        setErrorMsg('');
        
        // Fire the API call to suspend or resume the tournament
        fetch('/api/director/killswitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tournamentId: activeTournamentId, reason, action: isTriggered ? 'RESUME' : 'SUSPEND' })
        })
        .then(res => res.json())
        .then(data => {
          setIsSaving(false);
          if (data.error) {
            setErrorMsg(data.error);
            setDragProgress(0);
          } else {
            setIsTriggered(!isTriggered);
            setDragProgress(0); // Reset slider after action
          }
        })
        .catch(err => {
          setIsSaving(false);
          setErrorMsg('Failed to connect to system');
          setDragProgress(0);
        });
      }
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (!isTriggered) {
        // Snap back if not fully dragged
        setDragProgress(0);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTriggered]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
  };

  const handleReset = () => {
    // Only the Delegate can 'resume'
    setIsTriggered(false);
    setDragProgress(0);
  };

  return (
    <div className={`${styles.container} ${isTriggered ? styles.triggered : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <AlertTriangle className={isTriggered ? styles.iconAlert : styles.iconNormal} size={24} />
          <div>
            <h2 className={styles.title}>TOURNAMENT KILL SWITCH</h2>
            <p className={styles.subtitle}>
              {isTriggered 
                ? "SYSTEM SUSPENDED. All active matches frozen." 
                : "Slide to immediately halt all tournament operations."}
            </p>
          </div>
        </div>
      </div>

      <div 
        className={`${styles.sliderTrack} ${isTriggered ? styles.trackTriggered : ''}`}
        ref={trackRef}
      >
        {!isTriggered ? (
          <div className={styles.controls}>
            {errorMsg && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                ERROR: {errorMsg}
              </div>
            )}
            
            <div className={styles.reasonGroup}>
              <label className={styles.label}>Mandatory Reason Code</label>
              <select 
                className={styles.select}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={dragProgress > 0}
              >
                <option value="Weather Event">Weather Event</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Technical Failure">Technical Failure</option>
                <option value="Civil Disturbance">Civil Disturbance</option>
              </select>
            </div>
            
            <div className={styles.sliderContainer}>
              <div 
                className={styles.sliderFill} 
                style={{ width: `${dragProgress * 100}%` }}
              />
              <div className={styles.sliderText}>
                {isSaving ? 'OVERRIDING SYSTEM...' : 'SLIDE RIGHT TO SUSPEND'}
              </div>
              <div 
                className={`${styles.sliderHandle} ${dragProgress > 0 ? styles.handleDragging : ''}`}
                style={{ left: `calc(${dragProgress * 100}% - ${dragProgress * 48}px)` }}
                onMouseDown={handleMouseDown}
              >
                <Power size={24} />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.suspendedState}>
            <div className={styles.pulseRing} />
            <ShieldAlert size={48} className={styles.alertIcon} />
            <h3 className={styles.suspendedTitle}>SYSTEM SUSPENDED</h3>
            <p className={styles.suspendedDesc}>All matches are paused. Bracket is locked.</p>
            
            <div className={styles.sliderContainer} style={{ marginTop: '2rem', border: '1px solid #10b981' }}>
              <div 
                className={styles.sliderFill} 
                style={{ width: `${dragProgress * 100}%`, background: 'rgba(16, 185, 129, 0.2)' }}
              />
              <div className={styles.sliderText} style={{ color: '#10b981' }}>
                {isSaving ? 'RESTORING...' : 'SLIDE RIGHT TO RESUME'}
              </div>
              <div 
                className={`${styles.sliderHandle} ${dragProgress > 0 ? styles.handleDragging : ''}`}
                style={{ left: `calc(${dragProgress * 100}% - ${dragProgress * 48}px)`, background: '#10b981' }}
                onMouseDown={handleMouseDown}
              >
                <Power size={24} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
