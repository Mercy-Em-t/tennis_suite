"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarshalClient({ tournamentId, courts, scheduledMatches }: any) {
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [loadingCourt, setLoadingCourt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDispatch = async (courtId: string) => {
    if (!selectedMatch) {
      setError("Please select a scheduled match first.");
      return;
    }
    
    setLoadingCourt(courtId);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch, courtId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch match");
      }

      // Success, refresh the page to get updated server data
      setSelectedMatch("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCourt(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Court Dispatcher</h1>
        <p className="text-neutral-400">Assign scheduled matches to available courts in real-time.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      <div className="mb-12 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-neutral-200 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">1</span>
          Select Match to Dispatch
        </h2>
        
        {scheduledMatches.length === 0 ? (
          <div className="text-neutral-500 italic p-4 bg-neutral-950 rounded-xl border border-neutral-800">
            No scheduled matches available.
          </div>
        ) : (
          <select 
            className="w-full max-w-lg bg-neutral-950 border border-neutral-700 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
            value={selectedMatch}
            onChange={(e) => {
              setSelectedMatch(e.target.value);
              setError(null);
            }}
          >
            <option value="">-- Select a Scheduled Match --</option>
            {scheduledMatches.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.teamA?.franchiseName} vs {m.teamB?.franchiseName} (Stage: {m.stage})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-200 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">2</span>
          Assign to Court
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courts.map((court: any) => {
          const activeMatch = court.matches[0];
          const isOccupied = !!activeMatch;

          return (
            <div 
              key={court.id} 
              className={`border rounded-[2rem] p-8 transition-all duration-300 relative overflow-hidden group ${
                isOccupied 
                  ? 'bg-neutral-950/80 border-red-500/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                  : 'bg-neutral-900 border-neutral-700 hover:border-blue-500/40 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{court.name}</h3>
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{court.courtType?.replace('_', ' ')}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 ${
                  isOccupied ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                  {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                </div>
              </div>

              {isOccupied ? (
                <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
                  <div className="text-xs text-neutral-500 uppercase tracking-widest mb-4 font-mono">Current Match</div>
                  <div className="font-semibold text-lg text-blue-400 truncate">{activeMatch.teamA?.franchiseName}</div>
                  <div className="text-neutral-600 text-sm my-2 font-mono tracking-widest">VS</div>
                  <div className="font-semibold text-lg text-emerald-400 truncate">{activeMatch.teamB?.franchiseName}</div>
                  <div className="mt-6">
                    <span className="text-xs font-mono px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md inline-block text-neutral-400">
                      STATUS: {activeMatch.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[180px] border-2 border-dashed border-neutral-700/50 group-hover:border-blue-500/30 rounded-2xl transition-colors bg-neutral-950/30">
                  <button 
                    onClick={() => handleDispatch(court.id)}
                    disabled={!selectedMatch || loadingCourt === court.id}
                    className={`px-8 py-4 rounded-xl font-bold transition-all w-3/4 max-w-[200px] ${
                      !selectedMatch
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                        : loadingCourt === court.id
                        ? 'bg-blue-600/50 text-white cursor-wait border border-blue-500/50'
                        : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-500/50'
                    }`}
                  >
                    {loadingCourt === court.id ? 'Dispatching...' : 'Dispatch Here'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
