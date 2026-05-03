import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Gem, Sparkles, Plus, Crown } from 'lucide-react';
import JarDetail from './JarDetail';

function JarCard({ jar, onEdit, onDelete, onSelect, index }) {
  const maxTarget = jar.milestones?.[jar.milestones.length - 1]?.target || jar.target || 10000;
  const fillPercent = Math.min((jar.totalClips / maxTarget) * 100, 100);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const achieved = (jar.milestones || [])
      .map((m, idx) => ({ ...m, idx }))
      .filter((m) => jar.totalClips >= m.target && jar.totalClips - m.target < m.target * 0.5);
    if (achieved.length > 0) {
      const id = setTimeout(() => {
        setSparkles(achieved.map((m) => ({ id: m.idx, delay: m.idx * 0.15 })));
      }, 600);
      return () => clearTimeout(id);
    }
  }, []);

  const nextMilestone = (jar.milestones || []).find((m) => jar.totalClips < m.target);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
      className="glass shape-card-round p-4 relative overflow-hidden cursor-pointer group"
      whileHover={{ y: -4, boxShadow: `0 20px 56px rgba(0,0,0,0.5), 0 0 0 1px ${jar.color}30, 0 0 32px ${jar.color}15` }}
      style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${jar.color}15` }}
      onClick={() => onSelect(jar)}
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
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(jar); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors"
            aria-label={`Edit ${jar.name}`}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(jar.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-casino-danger hover:bg-white/5 transition-colors"
            aria-label={`Delete ${jar.name}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
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
              {(jar.milestones || []).map((m, idx) => {
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

          <div className="space-y-1">
            {(jar.milestones || []).map((m, idx) => {
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

function CompletedJarCard({ jar, onSelect, index }) {
  const maxTarget = jar.milestones?.[jar.milestones.length - 1]?.target || jar.target || 10000;
  const fillPercent = Math.min((jar.totalClips / maxTarget) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
      className="glass gold-foil p-3 relative overflow-hidden cursor-pointer shrink-0 w-[160px]"
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={() => onSelect(jar)}
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: jar.color }} />

      {/* Completed ribbon */}
      <div className="absolute top-0 right-0">
        <div className="jar-completed-ribbon">
          <Crown size={10} className="text-black" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="jar-visual" style={{ transform: 'scale(0.85)' }}>
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
          </div>
        </div>
        <h3 className="text-xs font-semibold text-white truncate w-full text-center">{jar.name}</h3>
        <span className="text-[9px] font-bold uppercase tracking-wider text-casino-accent">Completed</span>
      </div>
    </motion.div>
  );
}

export default function Jars({ jars, habits, history, onAddJar, onEditJar, onDeleteJar }) {
  const [selectedJarId, setSelectedJarId] = useState(null);

  const activeJars = jars.filter((j) => {
    const finalTarget = j.milestones?.[j.milestones.length - 1]?.target || j.target || 10000;
    return j.totalClips < finalTarget;
  });

  const completedJars = jars.filter((j) => {
    const finalTarget = j.milestones?.[j.milestones.length - 1]?.target || j.target || 10000;
    return j.totalClips >= finalTarget;
  });

  const selectedJar = jars.find((j) => j.id === selectedJarId);

  return (
    <div>
      <AnimatePresence mode="wait">
        {selectedJar ? (
          <JarDetail
            key="detail"
            jar={selectedJar}
            habits={habits}
            history={history}
            onBack={() => setSelectedJarId(null)}
            onEdit={onEditJar}
            onDelete={onDeleteJar}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Active Jars */}
            {activeJars.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {activeJars.map((jar, idx) => (
                  <JarCard
                    key={jar.id}
                    jar={jar}
                    onEdit={onEditJar}
                    onDelete={onDeleteJar}
                    onSelect={(j) => setSelectedJarId(j.id)}
                    index={idx}
                  />
                ))}
              </div>
            )}

            {/* Hall of Fame */}
            {completedJars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={14} className="text-casino-accent" />
                  <p className="text-xs font-semibold text-casino-accent tracking-tight">Hall of Fame</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar jar-hall-of-fame-shelf">
                  {completedJars.map((jar, idx) => (
                    <CompletedJarCard
                      key={jar.id}
                      jar={jar}
                      onSelect={(j) => setSelectedJarId(j.id)}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={onAddJar}
              whileHover={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-casino-accent)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-casino-text-tertiary transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Create Jar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
