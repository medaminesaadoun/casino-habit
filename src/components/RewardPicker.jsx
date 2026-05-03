import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

const TIER_COLORS = { 1: '#ef4444', 2: '#3b82f6', 3: '#a855f7', 4: '#e8b931' };
const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Jackpot' };

export default function RewardPicker({ tier, choices, onSelect, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: TIER_COLORS[tier] + '15', color: TIER_COLORS[tier], boxShadow: `0 0 12px ${TIER_COLORS[tier]}20` }}>
              <Sparkles size={12} />{TIER_LABELS[tier]}
            </span>
            <h2 className="text-lg font-bold text-white">Pick Your Prize</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-casino-text-tertiary mb-4">Choose one reward to add to your bank</p>

        <div className={`grid gap-3 ${choices.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {choices.map((reward) => (
            <button key={reward.id} onClick={() => onSelect(reward)} className="glass p-5 flex flex-col items-center gap-2 hover:bg-white/5 transition-all group">
              <span className="text-4xl">{reward.icon}</span>
              <span className="text-sm font-semibold text-white text-center leading-tight">{reward.name}</span>
              <span className="text-[10px] text-casino-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">Click to claim</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}