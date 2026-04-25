import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Trash2 } from 'lucide-react';

const TIER_BORDERS = { 1: '#ef4444', 2: '#3b82f6', 3: '#a855f7', 4: '#e8b931' };

function getDaysOld(wonAt) {
  const diff = Date.now() - new Date(wonAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function RewardBank({ rewards, onClaim, onDeleteAll }) {
  const sorted = [...rewards].sort((a, b) => new Date(b.wonAt) - new Date(a.wonAt));

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-casino-accent" />
          <p className="text-sm font-semibold text-white">Reward Bank</p>
          {rewards.length > 0 && <span className="glass px-2 py-0.5 rounded-full text-xs font-semibold text-casino-text-secondary tabular-nums">{rewards.length}</span>}
        </div>
        {rewards.length > 0 && (
          <button onClick={() => { if (window.confirm('Delete all unclaimed rewards?')) onDeleteAll(); }}
            className="btn-pill btn-ghost text-xs flex items-center gap-1 text-casino-danger">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="text-center py-10">
          <Gift size={32} className="mx-auto mb-3 text-casino-text-tertiary opacity-20" />
          <p className="text-casino-text-secondary text-sm">No rewards yet</p>
          <p className="text-casino-text-tertiary text-xs mt-1">Spin the wheel to win prizes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((reward) => {
            const daysOld = getDaysOld(reward.wonAt);
            const tierColor = TIER_BORDERS[reward.tier] || TIER_BORDERS[1];
            const showNudge = daysOld >= 3;

            return (
              <motion.div
                key={reward.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass p-4 flex flex-col items-center text-center overflow-hidden relative"
                style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 2px 0 ${tierColor}30` }}
              >
                {showNudge && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-casino-warning" />}
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
        </div>
      )}
    </div>
  );
}