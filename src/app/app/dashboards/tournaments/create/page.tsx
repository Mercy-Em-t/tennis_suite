"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const DEFAULT_CATEGORIES = [
  "Men's Singles",
  "Women's Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles"
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    contactPhone: "",
    formatType: "Round Robin",
    matchDuration: "60",
    surfaceType: "Hard",
    numCourts: "4",
    registrationFee: "",
    registrationStart: "",
    registrationEnd: "",
    allowMultiCategory: false,
  });

  const [scoringRules, setScoringRules] = useState({
    setsToWin: "2",
    gamesPerSet: "6",
    tiebreakAt: "6",
    advantage: "Standard"
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScoringChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScoringRules(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory("");
      setShowOtherCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (categories.length === 0) {
      setError("Please select at least one category.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        allowMultiCategory: formData.allowMultiCategory,
        matchDuration: formData.matchDuration ? parseInt(formData.matchDuration) : undefined,
        numCourts: formData.numCourts ? parseInt(formData.numCourts) : undefined,
        registrationFee: formData.registrationFee ? parseInt(formData.registrationFee) : undefined,
        categories: categories.join(", "),
        scoringRules: JSON.stringify(scoringRules),
      };

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tournament");
      }

      router.push(`/app/dashboards/tournaments/${data.tournament.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans flex justify-center">
      <div className="w-full max-w-4xl relative">
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
                  <label className="text-sm text-neutral-400 font-medium">Tournament Name *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. Summer Slam 2026" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Location / Venue *</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. Central Park Tennis Center" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Contact Phone *</label>
                  <input required name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="+254 700 000 000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Surface Type *</label>
                  <select required name="surfaceType" value={formData.surfaceType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none">
                    <option value="Hard">Hard Court</option>
                    <option value="Clay">Clay Court</option>
                    <option value="Grass">Grass Court</option>
                    <option value="Carpet">Carpet / Indoor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Start Date *</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">End Date *</label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
              </div>
            </div>

            {/* Section 2: Registration & Categories */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-neutral-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">2</div>
                Registration & Categories
              </h2>
              
              <div className="mb-6 space-y-3">
                <label className="text-sm text-neutral-400 font-medium">Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        categories.includes(cat) 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors border bg-blue-600 border-blue-500 text-white"
                    >
                      {cat}
                    </button>
                  ))}
                  {!showOtherCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowOtherCategory(true)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors border bg-neutral-950 border-dashed border-neutral-700 text-neutral-400 hover:text-white"
                    >
                      + Other
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Custom Category"
                        className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-full text-sm focus:border-blue-500 outline-none w-40"
                        autoFocus
                      />
                      <button type="button" onClick={addCustomCategory} className="text-blue-400 text-sm font-medium px-2 hover:text-blue-300">Add</button>
                      <button type="button" onClick={() => setShowOtherCategory(false)} className="text-neutral-500 text-sm hover:text-neutral-300">Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="multiCat"
                  checked={formData.allowMultiCategory}
                  onChange={(e) => setFormData(p => ({ ...p, allowMultiCategory: e.target.checked }))}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="multiCat" className="text-sm text-neutral-300 font-medium cursor-pointer">
                  Allow Multi-Category Registration (Players can join multiple events)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Registration Start Date *</label>
                  <input required type="date" name="registrationStart" value={formData.registrationStart} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Registration End Date *</label>
                  <input required type="date" name="registrationEnd" value={formData.registrationEnd} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none text-neutral-200 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Registration Fee (amount) *</label>
                  <input required type="number" name="registrationFee" value={formData.registrationFee} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="e.g. 50" min={0} />
                </div>
              </div>
            </div>

            {/* Section 3: Format & Scoring */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-neutral-200">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">3</div>
                Format & Scoring Rules
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Format Type *</label>
                  <select required name="formatType" value={formData.formatType} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none">
                    <option value="Round Robin">Round Robin</option>
                    <option value="Knockout">Knockout</option>
                    <option value="Pool + Knockout">Pool + Knockout</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400 font-medium">Match Duration (mins)</label>
                  <input type="number" name="matchDuration" value={formData.matchDuration} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-xl focus:border-blue-500 transition-colors focus:outline-none" placeholder="Optional" />
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wider">Scoring Configurator</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-500 font-medium uppercase">Sets to Win Match</label>
                    <select name="setsToWin" value={scoringRules.setsToWin} onChange={handleScoringChange} className="w-full bg-[#161b22] border border-neutral-800 p-3 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="1">1 Set</option>
                      <option value="2">2 Sets (Best of 3)</option>
                      <option value="3">3 Sets (Best of 5)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-500 font-medium uppercase">Games per Set</label>
                    <select name="gamesPerSet" value={scoringRules.gamesPerSet} onChange={handleScoringChange} className="w-full bg-[#161b22] border border-neutral-800 p-3 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="4">4 Games (Fast4)</option>
                      <option value="6">6 Games</option>
                      <option value="8">8 Games (Pro Set)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-500 font-medium uppercase">Tiebreak At</label>
                    <select name="tiebreakAt" value={scoringRules.tiebreakAt} onChange={handleScoringChange} className="w-full bg-[#161b22] border border-neutral-800 p-3 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="3">3-3</option>
                      <option value="4">4-4</option>
                      <option value="5">5-5</option>
                      <option value="6">6-6</option>
                      <option value="8">8-8</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-500 font-medium uppercase">Advantage Rules</label>
                    <select name="advantage" value={scoringRules.advantage} onChange={handleScoringChange} className="w-full bg-[#161b22] border border-neutral-800 p-3 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="Standard">Standard (Ad)</option>
                      <option value="No-Ad">No-Ad</option>
                    </select>
                  </div>
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
                    Creating...
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
