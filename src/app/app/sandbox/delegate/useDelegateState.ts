import { useState, useEffect } from 'react';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  reason?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface BroadcastMessage {
  id: string;
  message: string;
  timestamp: string;
  target: 'ALL' | 'HOSTS' | 'REFEREES' | 'MARSHALLS';
  isEmergency: boolean;
}

export interface FinancialData {
  totalRevenue: number;
  entryFeesCollected: number;
  entryFeesPending: number;
  prizePool: number;
  staffCosts: number;
}

const defaultAuditLogs: AuditLog[] = [
  { id: 'a1', timestamp: '08:00 AM', actor: 'Host', action: 'Tournament Started', severity: 'INFO' },
  { id: 'a2', timestamp: '09:15 AM', actor: 'Marshall Alex', action: 'Assigned Match M1 to Center Court', severity: 'INFO' },
  { id: 'a3', timestamp: '09:45 AM', actor: 'Referee Sarah', action: 'Verified Score for Match M1', severity: 'INFO' },
];

const defaultFinancials: FinancialData = {
  totalRevenue: 15000,
  entryFeesCollected: 12000,
  entryFeesPending: 3000,
  prizePool: 8000,
  staffCosts: 2000,
};

export function useDelegateState() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [financials, setFinancials] = useState<FinancialData>(defaultFinancials);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [systemSuspended, setSystemSuspended] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedLogs = localStorage.getItem('delegate_audit_v1');
    const storedFinancials = localStorage.getItem('delegate_financials_v1');
    const storedBroadcasts = localStorage.getItem('delegate_broadcasts_v1');
    const storedSuspended = localStorage.getItem('delegate_suspended_v1');

    if (storedLogs && storedFinancials && storedBroadcasts) {
      setAuditLogs(JSON.parse(storedLogs));
      setFinancials(JSON.parse(storedFinancials));
      setBroadcasts(JSON.parse(storedBroadcasts));
      setSystemSuspended(storedSuspended === 'true');
    } else {
      setAuditLogs(defaultAuditLogs);
      setFinancials(defaultFinancials);
      setBroadcasts([]);
      setSystemSuspended(false);
      localStorage.setItem('delegate_audit_v1', JSON.stringify(defaultAuditLogs));
      localStorage.setItem('delegate_financials_v1', JSON.stringify(defaultFinancials));
      localStorage.setItem('delegate_broadcasts_v1', JSON.stringify([]));
      localStorage.setItem('delegate_suspended_v1', 'false');
    }
    setLoaded(true);
  }, []);

  const appendAuditLog = (action: string, actor: string, severity: AuditLog['severity'], reason?: string) => {
    const newLog: AuditLog = {
      id: `a_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor,
      action,
      reason,
      severity
    };
    setAuditLogs(prev => {
      const next = [newLog, ...prev];
      localStorage.setItem('delegate_audit_v1', JSON.stringify(next));
      return next;
    });
  };

  const addBroadcast = (message: string, target: BroadcastMessage['target'], isEmergency: boolean) => {
    const newBroadcast: BroadcastMessage = {
      id: `bcast_${Date.now()}`,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target,
      isEmergency
    };
    setBroadcasts(prev => {
      const next = [newBroadcast, ...prev];
      localStorage.setItem('delegate_broadcasts_v1', JSON.stringify(next));
      return next;
    });
    
    // Log broadcasts to audit log as well
    appendAuditLog(`Broadcast sent to ${target}`, 'Delegate', isEmergency ? 'WARNING' : 'INFO', message);
  };

  const updateFinancials = (updates: Partial<FinancialData>) => {
    setFinancials(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('delegate_financials_v1', JSON.stringify(next));
      return next;
    });
  };

  const toggleSystemSuspension = (reason: string) => {
    const newStatus = !systemSuspended;
    setSystemSuspended(newStatus);
    localStorage.setItem('delegate_suspended_v1', String(newStatus));
    
    appendAuditLog(
      newStatus ? 'SYSTEM SUSPENDED (Kill Switch Activated)' : 'SYSTEM RESTORED (Kill Switch Deactivated)',
      'Delegate',
      'CRITICAL',
      reason
    );
  };

  return {
    auditLogs,
    financials,
    broadcasts,
    systemSuspended,
    appendAuditLog,
    addBroadcast,
    updateFinancials,
    toggleSystemSuspension,
    loaded
  };
}
