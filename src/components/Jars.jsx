import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Gem } from 'lucide-react';

function JarCard({ jar, onEdit, onDelete }) {
  const maxTarget = jar.milestones[jar.milestones.length - 1]?.target || 10000;
  const fillPercent = Math.min((jar.totalClips / maxTarget) * 100, 100);

  return (
    <motion.div
      layout
      className="glass p-4 relative overflow-hidden"
      style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${jar.color}15` }}
    >
      {/* Subtle colored glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: jar.color }} />
      
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: jar.color, boxShadow: `0 0 8px ${jar.color}60` }} />
          <h3 className="text-sm font-semibold text-white">{jar.name}</h3>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => onEdit(jar)} className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(jar.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-casino-text-tertiary hover:text-casino-danger hover:bg-white/5 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-casino-text-secondary font-medium tabular-nums">{jar.totalClips.toLocaleString()} clips</span>
          <span className="text-casino-text-tertiary">{Math.round(fillPercent)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: jar.color, boxShadow: `0 0 8px ${jar.color}40` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-1.5">
        {jar.milestones.map((m, idx) => {
          const achieved = jar.totalClips >= m.target;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <Gem size={10} className={achieved ? 'text-casino-accent' : 'text-casino-text-tertiary'} />
              <span className={`tabular-nums font-medium ${achieved ? 'text-casino-accent' : 'text-casino-text-secondary'}`}>
                {m.target.toLocaleString()}
              </span>
              <span className="text-casino-text-tertiary truncate flex-1">{m.reward}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Jars({ jars, onAddJar, onEditJar, onDeleteJar }) {
  return (
    <div className="space-y-2">
      {jars.map((jar) => (
        <JarCard key={jar.id} jar={jar} onEdit={onEditJar} onDelete={onDeleteJar} />
      ))}
      <button
        onClick={onAddJar}
        className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-casino-text-tertiary hover:text-casino-accent hover:border-casino-accent/20 transition-colors text-xs font-semibold"
      >
        + Create Jar
      </button>
    </div>
  );
}