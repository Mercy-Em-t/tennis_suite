'use client';

import React, { useState } from 'react';
import styles from './OverrideConfirmationModal.module.css';
import { ShieldAlert, X } from 'lucide-react';

interface OverrideConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  actionWarning?: string;
}

export function OverrideConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionWarning = "This action is permanent and will be recorded in the system audit log."
}: OverrideConfirmationModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.header}>
          <ShieldAlert className={styles.warningIcon} size={28} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        
        <p className={styles.description}>{description}</p>
        
        <div className={styles.warningBox}>
          {actionWarning}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            MANDATORY REASONING LOG
          </label>
          <textarea 
            className={styles.textarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this God-Mode override is necessary..."
            rows={3}
            autoFocus
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button 
            className={styles.confirmBtn} 
            onClick={() => {
              if (reason.trim().length > 5) {
                onConfirm(reason);
              }
            }}
            disabled={reason.trim().length < 5}
          >
            CONFIRM OVERRIDE
          </button>
        </div>
      </div>
    </div>
  );
}
