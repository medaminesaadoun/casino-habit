import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, X } from 'lucide-react';

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};

function getStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
  let streak = 1;
  const dayMs = 86400000;
  for (let i = 1; i < sorted.length; i++) {
    const diff = new Date(sorted[i - 1]) - new Date(sorted[i]);
    if (diff >= dayMs * 0.8 && diff <= dayMs * 1.2) streak++;
    else break;
  }
  return streak;
}

export default function SessionSummaryModal({
  isOpen,
  habit,
  clip,
  tokenWon,
  onDismiss,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onDismiss]);

  if (!isOpen || !habit) return null;

  const streak = getStreak(habit.completedDates);
  const clipColor = CLIP_COLORS[clip] || CLIP_COLORS.red;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="modal-panel text-center relative overflow-hidden max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: clipColor }}
        />

        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Habit name */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
          >
            <Check size={16} style={{ color: 'var(--color-casino-success)' }} />
          </div>
          <span className="text-sm font-semibold text-white">{habit.name}</span>
        </div>

        {/* Clip earned */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-2">
            <svg width="56" height="56" viewBox="0 0 44 40">
              <rect x="2" y="4" width="6" height="12" rx="2" fill="#8b8680" opacity="0.6" />
              <rect x="20" y="4" width="6" height="12" rx="2" fill="#8b8680" opacity="0.6" />
              <rect x="-4" y="11" width="42" height="24" rx="5" fill={clipColor} opacity="0.7" stroke={clipColor} strokeWidth="1.5" strokeOpacity="0.7" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white capitalize">{clip} clip earned!</span>
        </div>

        {/* Token result */}
        {tokenWon ? (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--color-casino-success)' }}
          >
            +1 Token
          </motion.div>
        ) : (
          <div className="text-sm text-casino-text-secondary mb-4">
            Token wheel — better luck next time
          </div>
        )}

        {/* Streak */}
        {streak >= 3 && (
          <div className="flex items-center justify-center gap-1.5 mb-5">
            <Flame size={16} style={{ color: 'var(--color-casino-warning)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--color-casino-warning)' }}>
              {streak} day streak!
            </span>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="btn-pill btn-gold w-full py-2.5 text-sm font-bold"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
