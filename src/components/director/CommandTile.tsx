import React from 'react';
import styles from './CommandTile.module.css';
import { LockOpen } from 'lucide-react';

interface CommandTileProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isUnlocked?: boolean;
  onUnlockToggle?: () => void;
  className?: string;
}

export function CommandTile({
  title,
  icon,
  children,
  isUnlocked = false,
  onUnlockToggle,
  className = '',
}: CommandTileProps) {
  return (
    <div className={`${styles.tile} ${isUnlocked ? styles.unlocked : ''} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          {icon && <span className={styles.titleIcon}>{icon}</span>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        {onUnlockToggle && (
          <button 
            className={`${styles.unlockBtn} ${isUnlocked ? styles.unlockBtnActive : ''}`}
            onClick={onUnlockToggle}
            title={isUnlocked ? "Lock Module" : "Unlock for God-Mode Edits"}
          >
            <LockOpen size={16} />
          </button>
        )}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
