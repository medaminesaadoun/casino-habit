import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRightLeft, Sparkles, Gem, Star } from 'lucide-react';

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};
const CLIP_LABELS = {
  red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow',
  purple: 'Purple', orange: 'Orange', gold: 'Gold',
};
const COLOR_SORT = { gold: 0, orange: 1, purple: 2, red: 3, blue: 4, green: 5, yellow: 6 };

function SingleClip({ color, stackIndex = 0, isDimmed = false }) {
  const bg = CLIP_COLORS[color] || CLIP_COLORS.red;
  return (
    <div
      className="clip-visual"
      style={{
        transform: stackIndex === 0 ? 'rotate(0deg)' : `rotate(${stackIndex * 6 - 3}deg)`,
        zIndex: 10 - stackIndex,
        opacity: isDimmed ? 0.5 : 1,
      }}
    >
      <div className="clip-handle-left" />
      <div className="clip-handle-right" />
      <div className="clip-body" style={{ backgroundColor: bg }}>
        <div className="clip-crease" />
        <span className="clip-label">{CLIP_LABELS[color]}</span>
      </div>
    </div>
  );
}

function RarityGlow({ color, children }) {
  if (color === 'gold') {
    return (
      <motion.div
        animate={{ boxShadow: ['0 0 8px rgba(232,185,49,0.3)', '0 0 16px rgba(232,185,49,0.6)', '0 0 8px rgba(232,185,49,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-full inline-flex"
      >
        {children}
      </motion.div>
    );
  }
  if (color === 'purple') {
    return (
      <div className="rounded-full inline-flex" style={{ boxShadow: '0 0 10px rgba(168,85,247,0.2)' }}>
        {children}
      </div>
    );
  }
  if (color === 'orange') {
    return (
      <div className="rounded-full inline-flex" style={{ boxShadow: '0 0 8px rgba(249,115,22,0.18)' }}>
        {children}
      </div>
    );
  }
  return <div className="inline-flex">{children}</div>;
}

function getHintMessage(clips, counts, activeTier) {
  if (clips.length === 0) return { text: 'Complete habits to collect clips', type: 'empty' };
  if (counts.gold && activeTier < 3) return { text: 'Gold ready — instant Tier 3!', type: 'gold' };
  const needed = activeTier === 1 ? 2 : activeTier === 2 ? 3 : 99;
  if (activeTier < 3) {
    const ready = Object.entries(counts).find(([c, n]) => c !== 'gold' && n >= needed);
    if (ready) return { text: `${CLIP_LABELS[ready[0]]} x${ready[1]} ready! Cash in for Tier ${activeTier + 1}`, type: 'ready' };
    return { text: `Need ${needed} matching clips to cash in`, type: 'progress' };
  }
  return { text: 'Tier 3 maxed — no more upgrades', type: 'maxed' };
}

export default function ClipInventory({ clips, activeTier, onDeleteAll }) {
  const counts = clips.reduce((acc, clip) => {
    acc[clip] = (acc[clip] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(counts).sort((a, b) => {
    const sortA = COLOR_SORT[a[0]] ?? 99;
    const sortB = COLOR_SORT[b[0]] ?? 99;
    if (sortA !== sortB) return sortA - sortB;
    return b[1] - a[1];
  });

  const needed = activeTier === 1 ? 2 : activeTier === 2 ? 3 : 99;
  const hint = getHintMessage(clips, counts, activeTier);

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">Clip Collection</p>
          <span className="glass px-2 py-0.5 rounded-full text-xs text-casino-text-tertiary tabular-nums">{clips.length} total</span>
        </div>
        {clips.length > 0 && (
          <button
            onClick={() => { if (window.confirm(`Delete all ${clips.length} clips?`)) onDeleteAll(); }}
            className="btn-pill btn-ghost text-xs flex items-center gap-1 text-casino-danger"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {clips.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <motion.span className="empty-float text-2xl block mb-2">📎</motion.span>
          <p className="text-casino-text-tertiary text-xs">Complete habits to collect clips</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-wrap gap-5 justify-center">
            {sorted.map(([color, count]) => {
              const isEligible = color === 'gold'
                ? activeTier < 3
                : activeTier < 3 && count >= needed;

              return (
                <motion.div
                  key={color}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <RarityGlow color={color}>
                    <div className="relative">
                      <SingleClip color={color} />
                      {count > 1 && (
                        <div
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white tabular-nums"
                          style={{ backgroundColor: CLIP_COLORS[color], boxShadow: `0 2px 6px ${CLIP_COLORS[color]}50` }}
                        >
                          {count}
                        </div>
                      )}
                      {isEligible && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -left-1"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-casino-success flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">&#10003;</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </RarityGlow>
                  <span className="text-[10px] font-semibold text-casino-text-tertiary uppercase tracking-wider">{CLIP_LABELS[color]}</span>
                  {activeTier < 3 && color !== 'gold' && (
                    <span className={`text-[9px] font-bold tabular-nums ${count >= needed ? 'text-casino-success' : 'text-casino-text-tertiary/50'}`}>
                      {count}/{needed}
                    </span>
                  )}
                  {color === 'gold' && activeTier < 3 && (
                    <span className="text-[9px] font-bold text-casino-accent tabular-nums">Ready</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Cash-in hint row */}
      {clips.length > 0 && (
        <div
          className={`mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] ${
            hint.type === 'ready' || hint.type === 'gold' ? 'text-casino-accent font-semibold' : 'text-casino-text-tertiary'
          }`}
        >
          {hint.type === 'gold' && <Star size={12} />}
          {hint.type === 'ready' && <Gem size={12} />}
          {hint.type === 'progress' && <ArrowRightLeft size={12} />}
          {hint.text}
        </div>
      )}
    </div>
  );
}

export { SingleClip, CLIP_COLORS, CLIP_LABELS };
