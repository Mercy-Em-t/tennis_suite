"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    formatType: "Fast4",
    matchDuration: "60",
    scoringRules: "Standard No-Ad",
    surfaceType: "Hard",
    numCourts: "4"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tournament");
      }

      // Route to the new tournament page or dashboard
      router.push(`/tournaments/${data.tournament.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans flex justify-center">
      <div className="w-full max-w-4xl relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Creation Wizard</h1>
            <p className="text-neutral-400">Configure your tournament pipeline and provision courts.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 rounded-[2rem] p-10 shadow-2xl space-y-10">
            
            {/* Section 1: Basics */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-neutral-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">1</div>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Tournament Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. Summer Slam 2026" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Location</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. Central Park Tennis Center" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Start Date</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">End Date</label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
              </div>
            </div>

            {/* Section 2: Format & Rules */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-neutral-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">2</div>
                Format & Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Format Type</label>
                  <select name="formatType" value={formData.formatType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none">
                    <option value="Fast4">Fast4</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Round-Robin">Round-Robin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Match Duration (mins)</label>
                  <input type="number" name="matchDuration" value={formData.matchDuration} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Scoring Rules</label>
                  <input name="scoringRules" value={formData.scoringRules} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. No-Ad" />
                </div>
              </div>
            </div>

            {/* Section 3: Facilities */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-neutral-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">3</div>
                Facilities Provisioning
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Surface Type</label>
                  <select name="surfaceType" value={formData.surfaceType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none">
                    <option value="Hard">Hard Court</option>
                    <option value="Clay">Clay Court</option>
                    <option value="Grass">Grass Court</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Number of Courts</label>
                  <input type="number" min="1" max="50" name="numCourts" value={formData.numCourts} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" />
                  <p className="text-xs text-neutral-500 mt-2 ml-1">We will automatically generate these court records for you.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Provisioning...
                  </>
                ) : (
                  "Create & Provision Tournament"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
