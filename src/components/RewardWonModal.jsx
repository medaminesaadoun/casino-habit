import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, X } from 'lucide-react';

const TIER_COLORS = { 1: '#ef4444', 2: '#3b82f6', 3: '#a855f7', 4: '#e8b931' };
const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Jackpot' };

export default function RewardWonModal({ reward, tier, onDismiss }) {
  const color = TIER_COLORS[tier];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onDismiss}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="modal-panel text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
        
        <button onClick={onDismiss} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10">
          <X size={18} />
        </button>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4" style={{ backgroundColor: color + '15', color, boxShadow: `0 0 16px ${color}20` }}>
          <Sparkles size={12} />{TIER_LABELS[tier]}
        </motion.div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="text-7xl mb-4">
          {reward.icon}
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-white mb-1">
          {reward.name}
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-casino-text-tertiary mb-6">
          Added to your Reward Bank
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button onClick={onDismiss} className="btn-pill btn-gold w-full py-3" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 20px ${color}40` }}>
            <Gift size={16} />Collect
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}