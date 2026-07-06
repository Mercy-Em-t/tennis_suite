import React from 'react';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  status = 'info',
  children,
  pulse = true,
  className = '',
}: StatusBadgeProps) {
  return (
    <div className={`${styles.badge} ${styles[status]} ${className}`}>
      <span 
        className={`${styles.indicator} ${styles[`indicator-${status}`]} ${pulse ? styles.pulse : ''}`} 
      />
      {children}
    </div>
  );
}
