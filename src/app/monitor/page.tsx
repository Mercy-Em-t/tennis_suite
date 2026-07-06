'use client';

import React, { useState, useEffect } from 'react';
import { systemHealth, TelemetryData, HealthStatus } from '@/lib/monitor/SystemHealthService';
import { emergencyIntervention } from '@/lib/monitor/EmergencyInterventionService';

export default function SystemMonitorDashboard() {
  const [overview, setOverview] = useState<Record<string, HealthStatus>>({});
  const [auditLog, setAuditLog] = useState<string[]>([]);

  // Mock polling the telemetry data
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this fetches from the backend via REST or SSE
      setOverview(systemHealth.getSystemOverview());
      setAuditLog(emergencyIntervention.getAuditTrail());
    }, 1000); // 1-second refresh rate for near-real-time (<100ms requirement ideally via SSE)

    return () => clearInterval(interval);
  }, []);

  const handleHotSwap = (clientId: string) => {
    // In real app: POST /api/monitor/intervene { action: 'HOT_SWAP' }
    emergencyIntervention.hotSwapStream('court_1', '192.168.1.100', 'Admin_TD_01');
  };

  const handleReset = (clientId: string) => {
    // In real app: POST /api/monitor/intervene { action: 'RESET_CONN' }
    emergencyIntervention.forceConnectionReset(clientId, 'Admin_TD_01');
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'GREEN': return 'bg-green-500';
      case 'AMBER': return 'bg-yellow-500';
      case 'RED': return 'bg-red-600 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">System Monitor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Mocking the mapping of clients, normally we'd map over active connections */}
        {Object.entries(overview).map(([clientId, status]) => (
          <div key={clientId} className={`p-6 rounded-lg border-2 ${status === 'RED' ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-gray-700'} bg-gray-800`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{clientId}</h2>
              <div className={`w-4 h-4 rounded-full ${getStatusColor(status)} shadow-lg`}></div>
            </div>
            <p className="text-sm text-gray-400 mb-6">Status: {status}</p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => handleReset(clientId)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                Force Reset
              </button>
              {status !== 'GREEN' && (
                <button 
                  onClick={() => handleHotSwap(clientId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Hot-Swap Stream
                </button>
              )}
            </div>
          </div>
        ))}
        {Object.keys(overview).length === 0 && (
          <p className="text-gray-500 italic">No active clients connected.</p>
        )}
      </div>

      <div className="bg-black/50 p-6 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Technical Audit Trail</h3>
        <div className="space-y-2 h-48 overflow-y-auto font-mono text-sm text-green-400">
          {auditLog.length === 0 ? (
            <p className="text-gray-600">No interventions logged.</p>
          ) : (
            auditLog.map((log, idx) => <div key={idx}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
