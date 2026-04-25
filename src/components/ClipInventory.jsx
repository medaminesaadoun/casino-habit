import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};
const CLIP_LABELS = {
  red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow',
  purple: 'Purple', orange: 'Orange', gold: 'Gold',
};

function SingleClip({ color }) {
  const bg = CLIP_COLORS[color] || CLIP_COLORS.red;
  return (
    <div className="clip-visual">
      <div className="clip-handle-left" />
      <div className="clip-handle-right" />
      <div className="clip-body" style={{ backgroundColor: bg }}>
        <div className="clip-crease" />
        <span className="clip-label">{CLIP_LABELS[color]}</span>
      </div>
    </div>
  );
}

export default function ClipInventory({ clips, onDeleteAll }) {
  const counts = clips.reduce((acc, clip) => {
    acc[clip] = (acc[clip] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">Clip Collection</p>
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
        <p className="text-casino-text-tertiary text-center py-6 text-xs">Complete habits to collect clips</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(counts).map(([color, count]) => (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="relative">
                <SingleClip color={color} />
                {count > 1 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white tabular-nums"
                    style={{ backgroundColor: CLIP_COLORS[color], boxShadow: `0 2px 6px ${CLIP_COLORS[color]}50` }}>
                    {count}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-semibold text-casino-text-tertiary uppercase tracking-wider">{CLIP_LABELS[color]}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export { SingleClip, CLIP_COLORS, CLIP_LABELS };