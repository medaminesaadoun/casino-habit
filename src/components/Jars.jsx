import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Gem, Sparkles, Plus } from 'lucide-react';

function JarCard({ jar, onEdit, onDelete, index }) {
  const maxTarget = jar.milestones[jar.milestones.length - 1]?.target || 10000;
  const fillPercent = Math.min((jar.totalClips / maxTarget) * 100, 100);
  const [sparkles, setSparkles] = useState([]);

  // Trigger sparkle burst for newly achieved milestones on mount
  useEffect(() => {
    const achieved = jar.milestones
      .map((m, idx) => ({ ...m, idx }))
      .filter((m) => jar.totalClips >= m.target && jar.totalClips - m.target < m.target * 0.5);
    if (achieved.length > 0) {
      const id = setTimeout(() => {
        setSparkles(achieved.map((m) => ({ id: m.idx, delay: m.idx * 0.15 })));
      }, 600);
      return () => clearTimeout(id);
    }
  }, []);

  const nextMilestone = jar.milestones.find((m) => jar.totalClips < m.target);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
      className="glass shape-card-alt p-4 relative overflow-hidden"
      whileHover={{ y: -2, boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${jar.color}30, 0 0 24px ${jar.color}15` }}
      style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${jar.color}15` }}
    >
      {/* Colored glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ backgroundColor: jar.color }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: jar.color, boxShadow: `0 0 8px ${jar.color}60` }} />
          <h3 className="text-sm font-semibold text-white truncate">{jar.name}</h3>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button onClick={() => onEdit(jar)} className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(jar.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-casino-danger hover:bg-white/5 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Body — jar visual + info side by side */}
      <div className="flex items-center gap-4">
        {/* Jar Visual */}
        <div className="relative shrink-0">
          <div className="jar-visual">
            <div className="jar-lid" />
            <div className="jar-neck" />
            <div className="jar-body">
              <motion.div
                className="jar-fill"
                initial={{ height: 0 }}
                animate={{ height: `${fillPercent}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                style={{ backgroundColor: jar.color }}
              />
              <div className="jar-count">{jar.totalClips.toLocaleString()}</div>
              {/* Milestone ticks */}
              {jar.milestones.map((m, idx) => {
                const tickPercent = Math.min((m.target / maxTarget) * 100, 100);
                const achieved = jar.totalClips >= m.target;
                return (
                  <div
                    key={idx}
                    className={`jar-tick ${achieved ? 'jar-tick-achieved' : ''}`}
                    style={{
                      bottom: `${tickPercent}%`,
                      backgroundColor: achieved ? jar.color : 'rgba(255,255,255,0.08)',
                    }}
                  />
                );
              })}
            </div>
          </div>
          {/* Sparkle burst for achieved milestones */}
          <AnimatePresence>
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: s.delay, duration: 0.4 }}
                className="absolute -top-1 -right-1 jar-sparkle"
              >
                <Sparkles size={14} style={{ color: jar.color }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-casino-text-secondary font-medium tabular-nums mb-1">
            {jar.totalClips.toLocaleString()}{' '}
            <span className="text-casino-text-tertiary">/ {maxTarget.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-casino-text-tertiary mb-2">
            {Math.round(fillPercent)}% full
          </div>

          {/* Milestones compact */}
          <div className="space-y-1">
            {jar.milestones.map((m, idx) => {
              const achieved = jar.totalClips >= m.target;
              return (
                <motion.div
                  key={idx}
                  className="flex items-center gap-1.5 text-[10px]"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                >
                  {achieved ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, delay: 0.4 + idx * 0.08 }}
                    >
                      <Gem size={10} style={{ color: jar.color }} />
                    </motion.div>
                  ) : (
                    <div className="w-[10px] flex justify-center">
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                    </div>
                  )}
                  <span className={`tabular-nums font-medium ${achieved ? 'text-white' : 'text-casino-text-secondary'}`}>
                    {m.target.toLocaleString()}
                  </span>
                  <span className={`truncate flex-1 ${achieved ? 'text-casino-text-tertiary' : 'text-casino-text-tertiary/60'}`}>
                    {m.reward}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Next milestone hint */}
          {nextMilestone && (
            <div className="mt-2 text-[9px] text-casino-text-tertiary/50 tabular-nums">
              {(nextMilestone.target - jar.totalClips).toLocaleString()} to {nextMilestone.reward}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Jars({ jars, onAddJar, onEditJar, onDeleteJar }) {
  return (
    <div>
      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {jars.map((jar, idx) => (
          <JarCard key={jar.id} jar={jar} onEdit={onEditJar} onDelete={onDeleteJar} index={idx} />
        ))}
      </div>
      <motion.button
        onClick={onAddJar}
        whileHover={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-casino-accent)' }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-casino-text-tertiary transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
      >
        <Plus size={14} /> Create Jar
      </motion.button>
    </div>
  );
}
