'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function UmpireClaimPage() {
  const router = useRouter();
  const [tournamentId, setTournamentId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 characters.');
      return;
    }
    if (!tournamentId) {
      setError('Tournament ID is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/player/umpire/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, tournamentId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to the active scoring arena
        router.push(`/app/dashboards/player/umpire/${data.tournamentId}/${data.matchId}`);
      } else {
        setError(data.error || 'Failed to claim match. Invalid PIN or Tournament ID.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#161b22] border-white/10 p-8 shadow-2xl rounded-2xl relative overflow-hidden">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <span className="text-2xl">🎾</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Claim Umpire Terminal</h1>
            <p className="text-slate-400 text-sm">Enter the Tournament ID and the 6-digit match PIN provided by your Referee.</p>
          </div>

          <form onSubmit={handleClaim} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tournament ID
              </label>
              <input
                type="text"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                placeholder="e.g. cm2h8x..."
                className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Match PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="6-DIGIT PIN"
                maxLength={6}
                className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center text-xl font-bold tracking-[0.2em] font-mono uppercase"
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || pin.length !== 6 || !tournamentId}
              className="w-full py-3 mt-2 font-bold text-lg"
            >
              {loading ? 'Authenticating...' : 'Access Terminal →'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
