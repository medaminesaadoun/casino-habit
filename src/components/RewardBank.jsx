import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Clock, Trash2 } from 'lucide-react';

const TIER_BORDERS = {
  1: 'var(--color-tier-1)',
  2: 'var(--color-tier-2)',
  3: 'var(--color-tier-3)',
  4: 'var(--color-tier-jackpot)',
};

const TIER_COLORS = {
  1: '#ef4444',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#e8b931',
};

const TIER_LABELS = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Jackpot',
};

const FILTER_OPTIONS = ['All', 'Tier 1', 'Tier 2', 'Tier 3', 'Jackpot'];

function getDaysOld(wonAt) {
  const diff = Date.now() - new Date(wonAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function RewardBank({ rewards, onClaim, onDeleteAll, onRequestConfirm }) {
  const [filter, setFilter] = useState('All');
  const sorted = [...rewards].sort((a, b) => new Date(b.wonAt) - new Date(a.wonAt));
  const filtered = filter === 'All'
    ? sorted
    : sorted.filter((r) => TIER_LABELS[r.tier] === filter);

  return (
    <div className="glass shape-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-casino-accent" />
          <p className="font-heading text-sm text-white tracking-tight">Reward Bank</p>
          {rewards.length > 0 && <span className="glass px-2 py-0.5 rounded-full text-xs font-semibold text-casino-text-secondary tabular-nums">{rewards.length}</span>}
        </div>
        {rewards.length > 0 && (
          <button onClick={() => {
            onRequestConfirm({
              title: 'Delete All Rewards?',
              message: 'Remove all unclaimed rewards from your bank? This cannot be undone.',
              danger: true,
              onConfirm: onDeleteAll,
            });
          }}
            className="btn-pill btn-ghost text-xs flex items-center gap-1 text-casino-danger">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Tier filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {FILTER_OPTIONS.map((label) => {
          const tierNum = label === 'All' ? 0 : label === 'Jackpot' ? 4 : parseInt(label.replace('Tier ', ''));
          const color = tierNum === 0 ? 'var(--color-casino-accent)' : TIER_COLORS[tierNum];
          const isActive = filter === label;
          return (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 ${
                isActive
                  ? ''
                  : 'glass text-casino-text-tertiary hover:text-casino-text-secondary'
              }`}
              style={
                isActive
                  ? { backgroundColor: color + '20', color: color, border: `1px solid ${color}40`, boxShadow: `0 0 12px ${color}20` }
                  : {}
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {rewards.length === 0 ? (
        <div className="text-center py-10">
          <Gift size={32} className="mx-auto mb-3 text-casino-text-tertiary opacity-20" />
          <p className="text-casino-text-secondary text-sm">No rewards yet</p>
          <p className="text-casino-text-tertiary text-xs mt-1">Spin the wheel to win prizes</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-casino-text-secondary text-sm">No {filter} rewards</p>
          <p className="text-casino-text-tertiary text-xs mt-1">Try another filter or spin for more prizes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((reward) => {
              const daysOld = getDaysOld(reward.wonAt);
              const tierColor = TIER_BORDERS[reward.tier] || TIER_BORDERS[1];
              const showNudge = daysOld >= 3;

              return (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ y: -3, scale: 1.02, boxShadow: `0 12px 40px rgba(0,0,0,0.4), inset 0 2px 0 ${tierColor}50, 0 0 20px ${tierColor}20` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="glass shape-card p-4 flex flex-col items-center text-center overflow-hidden relative"
                  style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 2px 0 ${tierColor}30, 0 0 40px ${tierColor}08` }}
                >
                  {showNudge && (
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-casino-warning"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="text-3xl mb-2">{reward.icon}</span>
                  <span className="text-sm font-semibold text-white leading-tight mb-1">{reward.name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-casino-text-tertiary mb-3 tabular-nums font-medium">
                    <Clock size={10} />{daysOld === 0 ? 'Today' : daysOld === 1 ? '1d ago' : `${daysOld}d ago`}
                  </div>
                  <button onClick={() => onClaim(reward)} className="btn-pill btn-gold w-full py-2 text-xs">
                    Claim
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
