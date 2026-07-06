'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './GlassCard.module.css';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function GlassCard({ children, interactive = false, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`${styles.card} ${interactive ? styles.interactive : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
