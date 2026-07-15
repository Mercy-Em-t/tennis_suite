'use client';

import React, { useState, useEffect } from 'react';

type HealthStatus = 'GREEN' | 'AMBER' | 'RED';

export default function SystemMonitorDashboard() {
  const [overview, setOverview] = useState<Record<string, HealthStatus>>({});
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  // Poll the backend REST API
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/monitor/telemetry');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setOverview(data.overview || {});
        setAuditLog(data.auditLog || []);
        setIsError(false);
      } catch (err) {
        setIsError(true);
      }
    };

    fetchTelemetry(); // Initial fetch
    const interval = setInterval(fetchTelemetry, 2000); // 2-second REST polling rate

    return () => clearInterval(interval);
  }, []);

  const handleHotSwap = async (clientId: string) => {
    await fetch('/api/monitor/intervene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'HOT_SWAP', clientId })
    });
  };

  const handleReset = async (clientId: string) => {
    await fetch('/api/monitor/intervene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_CONN', clientId })
    });
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
