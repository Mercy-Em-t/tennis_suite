"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DirectorDashboard({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const generateBracket = async () => {
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/generate-bracket`, {
        method: "POST"
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate bracket");
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="z-10 w-full max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Tournament Director
          </h1>
          <p className="text-neutral-400 text-lg">
            Standings & Progression Engine Control Panel
          </p>
          <div className="mt-4 px-4 py-2 bg-neutral-900/50 inline-block rounded-full border border-neutral-800">
            <span className="text-neutral-500 text-sm font-mono">ID: {tournamentId}</span>
          </div>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur-3xl border border-neutral-800/50 rounded-[2.5rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
              <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Generate Knockout Phase</h2>
            <p className="text-neutral-500 max-w-md mx-auto">
              This engine will evaluate all completed pool matches, tally the leaderboard (Wins, Set Diff, Game Diff), and programmatically spawn the next bracket matches.
            </p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={generateBracket}
              disabled={loading}
              className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] border border-white/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Running Pipeline...
                  </>
                ) : (
                  "Execute Progression Engine"
                )}
              </span>
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center"
              >
                <div className="font-semibold mb-1">Pipeline Failed</div>
                <div className="text-red-400/80 text-sm">{error}</div>
              </motion.div>
            )}

            {successData && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center"
              >
                <div className="font-semibold text-lg mb-2 text-emerald-300">Pipeline Executed Successfully!</div>
                <div className="text-emerald-400/80 mb-4">{successData.message}</div>
                <div className="bg-emerald-950/50 p-4 rounded-xl text-left border border-emerald-500/10">
                  <pre className="text-xs font-mono overflow-auto max-h-40">
                    {JSON.stringify(successData.matches, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
