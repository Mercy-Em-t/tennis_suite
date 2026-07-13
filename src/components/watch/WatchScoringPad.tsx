"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function WatchScoringPad({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchScore = async () => {
    try {
      const res = await fetch(`/api/watch/match/${matchId}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
    // Simulate real-time updates for now with polling,
    // though real implementation uses WebSockets
    const interval = setInterval(fetchScore, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  const handleAction = async (action: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    // Haptic feedback simulation in browser
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    try {
      const res = await fetch("/api/watch/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, action }),
      });
      if (res.ok) {
        await fetchScore();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="animate-pulse flex items-center justify-center w-full h-full">Loading...</div>;
  }

  if (!data) {
    return <div>Match not found</div>;
  }

  return (
    <div className="flex flex-col items-center justify-between w-full h-[300px]">
      {/* Header / Score Display */}
      <div className="text-center w-full mt-2">
        <div className="text-xs text-neutral-400 font-medium truncate px-4">{data.m}</div>
        <div className="text-2xl font-bold tracking-tighter mt-1">{data.s}</div>
      </div>

      {/* Main Scoring Buttons */}
      <div className="flex justify-between w-full px-6 mt-4">
        <button
          onClick={() => handleAction("POINT_SRV")}
          disabled={actionLoading}
          className="w-[110px] h-[110px] bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Point</span>
          <span className="text-xl font-bold mt-1">SRV</span>
          {data.srv === 1 && <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>}
        </button>
        <button
          onClick={() => handleAction("POINT_RCV")}
          disabled={actionLoading}
          className="w-[110px] h-[110px] bg-cyan-800 hover:bg-cyan-700 active:bg-cyan-600 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Point</span>
          <span className="text-xl font-bold mt-1">RCV</span>
          {data.srv === 2 && <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center space-x-3 w-full mt-4">
        <button
          onClick={() => handleAction("FAULT")}
          disabled={actionLoading}
          className="h-12 px-6 bg-red-900/50 hover:bg-red-800/80 active:bg-red-700 text-red-100 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          FAULT
        </button>
        <button
          onClick={() => handleAction("LET")}
          disabled={actionLoading}
          className="h-12 px-5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          LET
        </button>
        <button
          onClick={() => handleAction("UNDO")}
          disabled={actionLoading}
          className="h-12 w-12 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full text-sm font-bold flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          aria-label="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
      </div>
    </div>
  );
}
