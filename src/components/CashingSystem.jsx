import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRightLeft } from 'lucide-react';

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};
const CLIP_LABELS = {
  red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow',
  purple: 'Purple', orange: 'Orange', gold: 'Gold',
};

function MiniClip({ color }) {
  const bg = CLIP_COLORS[color] || CLIP_COLORS.red;
  return (
    <div className="relative" style={{ width: 40, height: 36 }}>
      <div className="absolute top-0 left-2 w-1.5 h-3 border-2 border-[#8b8680] border-b-0 rounded-t-sm z-[1]" style={{ transform: 'rotate(-12deg)' }} />
      <div className="absolute top-0 right-2 w-1.5 h-3 border-2 border-[#8b8680] border-b-0 rounded-t-sm z-[1]" style={{ transform: 'rotate(12deg)' }} />
      <div className="absolute bottom-0 left-0 w-10 h-5 rounded-sm z-[2] overflow-hidden" style={{ backgroundColor: bg }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5" />
        <span className="absolute bottom-0.5 left-0 right-0 text-center text-[6px] font-bold text-black/40 uppercase">{CLIP_LABELS[color]}</span>
      </div>
    </div>
  );
}

export default function CashingSystem({ clips, jars, activeTier, defaultJarId, onCashIn, onClose }) {
  const [selectedJar, setSelectedJar] = useState(defaultJarId || jars[0]?.id || '');
  const counts = clips.reduce((acc, clip) => { acc[clip] = (acc[clip] || 0) + 1; return acc; }, {});

  const handleCashIn = (color, clipsToRemove, newTier) => {
    if (!selectedJar) return;
    onCashIn({ jarId: selectedJar, color, clipsToRemove, newTier });
  };

  const getOptionsForColor = (color, count) => {
    const options = [];
    if (color === 'gold') {
      if (activeTier < 3) options.push({ label: 'Instant Tier 3', clips: ['gold'], tier: 3, color: 'text-yellow-400', bg: 'bg-yellow-500/10' });
      return options;
    }
    if (activeTier === 1) {
      if (count >= 2) options.push({ label: '2 → Tier 2', clips: Array(2).fill(color), tier: 2, color: 'text-blue-400', bg: 'bg-blue-500/10' });
      if (count >= 3) options.push({ label: '3 → Tier 3', clips: Array(3).fill(color), tier: 3, color: 'text-purple-400', bg: 'bg-purple-500/10' });
    } else if (activeTier === 2) {
      if (count >= 3) options.push({ label: '3 → Tier 3', clips: Array(3).fill(color), tier: 3, color: 'text-purple-400', bg: 'bg-purple-500/10' });
    }
    return options;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-panel">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-casino-accent" />
            <h2 className="text-lg font-bold text-white">Cash In</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-casino-text-tertiary mb-5">Trade matching clips to upgrade your spin tier. Tiers reset after each spin.</p>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-casino-text-secondary mb-1.5">Deposit to Jar</label>
          <select value={selectedJar} onChange={(e) => setSelectedJar(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-casino-accent transition-colors">
            {jars.map((jar) => <option key={jar.id} value={jar.id} style={{ background: '#1a1a1f' }}>{jar.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {Object.entries(counts).map(([color, count]) => {
            const options = getOptionsForColor(color, count);
            if (options.length === 0) return null;
            return (
              <div key={color} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <MiniClip color={color} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm capitalize">{CLIP_LABELS[color]}</div>
                  <div className="text-[11px] text-casino-text-tertiary mb-1.5">You have {count}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleCashIn(color, opt.clips, opt.tier)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 ${opt.bg} ${opt.color}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeTier > 1 && (
          <div className="mt-4 p-3 rounded-xl bg-casino-accent/5 border border-casino-accent/10">
            <p className="text-xs text-casino-accent text-center font-semibold">Tier {activeTier} active for your next spin</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}