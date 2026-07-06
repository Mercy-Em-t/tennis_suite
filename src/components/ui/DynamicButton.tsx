'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './DynamicButton.module.css';

export interface DynamicButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function DynamicButton({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: DynamicButtonProps) {
  return (
    <motion.button
      className={`${styles.button} ${styles[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      <div className={styles.glow} />
    </motion.button>
  );
}
