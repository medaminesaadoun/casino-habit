import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, X, Zap, Clock } from 'lucide-react';

const TIER_COLORS = { 1: '#e63946', 2: '#4cc9f0', 3: '#f72585', 4: '#ffd60a' };
const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Jackpot' };

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function formatDuration(min) {
  if (!min) return '';
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${min}m`;
}

export default function RewardWonModal({ reward, tier, onUseNow, onClaimLater }) {
  const color = TIER_COLORS[tier];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onClaimLater}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="modal-panel text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated pulsing glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 200, height: 200, backgroundColor: color, filter: 'blur(60px)', top: -40, left: '50%', transform: 'translateX(-50%)' }}
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <button onClick={onClaimLater} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10">
          <X size={18} />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4"
          style={{ backgroundColor: color + '15', color, boxShadow: `0 0 16px ${color}20` }}
        >
          <Sparkles size={12} />{TIER_LABELS[tier]}
        </motion.div>

        {/* Icon with bounce-wiggle + particle burst */}
        <div className="relative inline-block mb-4">
          <motion.svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 120, height: 120 }}
            initial="hidden"
            animate="visible"
          >
            {BURST_ANGLES.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <motion.circle
                  key={angle}
                  cx={60 + Math.cos(rad) * 48}
                  cy={60 + Math.sin(rad) * 48}
                  r={3}
                  fill={color}
                  variants={{
                    hidden: { opacity: 0, scale: 0 },
                    visible: { opacity: [0, 1, 0], scale: [0, 1.5, 0] },
                  }}
                  transition={{ delay: 0.15 + i * 0.03, duration: 0.6 }}
                />
              );
            })}
          </motion.svg>

          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: [0, 1.3, 0.9, 1.1, 1], rotate: [-15, 8, -5, 3, 0] }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="text-7xl"
          >
            {reward.icon}
          </motion.div>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl font-heading text-white mb-1">
          {reward.name}
        </motion.h2>

        {reward.durationMinutes > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm font-semibold mb-3" style={{ color }}>
            {formatDuration(reward.durationMinutes)}
          </motion.p>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs font-body text-casino-text-tertiary mb-6">
          What would you like to do?
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-3">
          <button
            onClick={onUseNow}
            className="btn-pill btn-gold w-full py-3 text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 24px ${color}50, 0 0 48px ${color}20` }}
          >
            <Zap size={16} /> Use Now
          </button>
          <button
            onClick={onClaimLater}
            className="text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors w-full py-1"
          >
            <Clock size={12} className="inline mr-1" />Claim for Later
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
