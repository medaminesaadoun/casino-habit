import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, SkipForward, CheckCircle2, XCircle } from 'lucide-react';

const TIER_COLORS = {
  1: '#ef4444', 2: '#3b82f6', 3: '#a855f7', 4: '#e8b931',
};

function formatTime(ms) {
  if (ms <= 0) return '0:00';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveRewards({ rewards, onSkipGrace, onCompleteEarly, onDismissExpired, onCancelGrace }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!rewards || rewards.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-white">Active Rewards</p>
        <span className="glass px-2 py-0.5 rounded-full text-xs font-semibold text-casino-accent tabular-nums">{rewards.length}</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {rewards.map((reward) => {
          const claimedAt = new Date(reward.claimedAt).getTime();
          const graceMs = (reward.gracePeriodMinutes || 0) * 60000;
          const durationMs = (reward.durationMinutes || 60) * 60000;
          const tierColor = TIER_COLORS[reward.tier] || TIER_COLORS[1];

          let status = reward.status, progress = 0, timeLabel = '';

          if (status === 'grace') {
            const elapsed = now - claimedAt;
            const remaining = graceMs - elapsed;
            if (remaining <= 0) status = 'active';
            else { progress = elapsed / graceMs; timeLabel = `Starts in ${formatTime(remaining)}`; }
          }
          if (status === 'active') {
            const startedAt = reward.startedAt ? new Date(reward.startedAt).getTime() : claimedAt + graceMs;
            const elapsed = now - startedAt;
            const remaining = durationMs - elapsed;
            if (remaining <= 0) status = 'expired';
            else { progress = elapsed / durationMs; timeLabel = `${formatTime(remaining)} left`; }
          }
          if (status === 'expired') { timeLabel = 'Expired'; progress = 1; }

          return (
            <motion.div
              key={reward.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass min-w-[280px] max-w-[300px] lg:min-w-[320px] lg:max-w-[340px] shrink-0 overflow-hidden snap-start"
              style={{ borderLeft: `3px solid ${tierColor}` }}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{reward.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{reward.rewardName}</div>
                    <div className="text-[10px] text-casino-text-tertiary font-medium">
                      {status === 'grace' ? 'Grace' : status === 'active' ? 'Active' : 'Expired'}
                    </div>
                  </div>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tierColor, opacity: 0.8 }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-casino-text-tertiary tabular-nums font-medium">
                    <Timer size={10} />{timeLabel}
                  </div>
                  {status === 'grace' && (
                    <div className="flex gap-1">
                      <button onClick={() => onSkipGrace(reward)} className="p-1 rounded-lg hover:bg-white/5 text-blue-400 transition-colors"><SkipForward size={13} /></button>
                      <button onClick={() => onCancelGrace(reward)} className="p-1 rounded-lg hover:bg-white/5 text-red-400 transition-colors"><XCircle size={13} /></button>
                    </div>
                  )}
                  {status === 'active' && (
                    <button onClick={() => { if (window.confirm(`Complete "${reward.rewardName}" early?`)) onCompleteEarly(reward); }}
                      className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-[10px] font-semibold transition-colors">
                      <CheckCircle2 size={10} className="inline mr-0.5" />Done
                    </button>
                  )}
                  {status === 'expired' && (
                    <button onClick={() => onDismissExpired(reward)} className="px-2 py-0.5 rounded-lg hover:bg-white/5 text-casino-text-tertiary hover:text-white text-[10px] font-medium transition-colors">Dismiss</button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}