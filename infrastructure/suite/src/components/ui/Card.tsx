import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hoverable?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = false, hoverable = false, style, onClick }) => {
  return (
    <motion.div 
      whileHover={hoverable ? { y: -4, boxShadow: '0 10px 30px -10px rgba(34, 211, 238, 0.15)' } : undefined}
      className={`${styles.card} ${glass ? styles.glass : ''} ${hoverable ? styles.hoverable : ''} ${className || ''}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
