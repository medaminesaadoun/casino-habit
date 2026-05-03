import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Pencil, Flame, Zap, Calendar } from 'lucide-react';

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

function getLastCompletedText(dates) {
  if (dates.length === 0) return 'Never';
  const last = new Date(dates[dates.length - 1]);
  const now = new Date();
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getRecencyLevel(dates) {
  if (dates.length === 0) return 'very-stale';
  const last = new Date(dates[dates.length - 1]);
  const now = new Date();
  const diffMs = now - last;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMs < 86400000 && last.getDate() === now.getDate()) return 'today';
  if (diffDays <= 1) return 'yesterday';
  if (diffDays <= 3) return 'stale';
  return 'very-stale';
}

function getWeeklyCompletions(habits) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  return habits.reduce((total, h) => {
    return total + (h.completedDates || []).filter((d) => new Date(d) > weekAgo).length;
  }, 0);
}

const RECENCY_STYLES = {
  today: { barGlow: 0.9, barOpacity: 1, staleText: false },
  yesterday: { barGlow: 0.4, barOpacity: 1, staleText: false },
  stale: { barGlow: 0, barOpacity: 0.5, staleText: true },
  'very-stale': { barGlow: 0, barOpacity: 0.4, staleText: true },
};

function HabitCard({ habit, jar, onComplete, onEdit, onDelete, index }) {
  const streak = getStreak(habit.completedDates);
  const lastText = getLastCompletedText(habit.completedDates);
  const hasStreak = streak >= 3;
  const recency = getRecencyLevel(habit.completedDates);
  const styles = RECENCY_STYLES[recency];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      whileHover={{ y: -3, boxShadow: `0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px ${habit.color}30` }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: index * 0.04 }}
      className="glass shape-card overflow-hidden relative"
    >
      {/* Stale alert dot */}
      {recency === 'very-stale' && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full z-10"
          style={{ backgroundColor: '#f59e0b' }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="flex">
        {/* Left accent bar */}
        <div
          className="w-[3px] shrink-0 rounded-l-2xl"
          style={{
            backgroundColor: habit.color,
            opacity: styles.barOpacity,
            boxShadow: styles.barGlow > 0
              ? `0 0 ${12 * styles.barGlow}px ${habit.color}${Math.round(80 * styles.barGlow).toString(16).padStart(2, '0')}`
              : undefined,
          }}
        />
        <div className="flex-1 p-4">
          {/* Top row */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: habit.color, boxShadow: `0 0 8px ${habit.color}50` }}
              />
              {jar && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: jar.color + '20', color: jar.color }}
                >
                  {jar.name}
                </span>
              )}
              {recency === 'today' && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-casino-success">Done</span>
              )}
            </div>
            <div className="flex gap-0.5">
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors"
                aria-label={`Edit ${habit.name}`}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(habit.id)}
                className="p-1.5 rounded-lg text-casino-text-tertiary hover:text-casino-danger hover:bg-white/5 transition-colors"
                aria-label={`Delete ${habit.name}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Name + description + tags */}
          <h3 className="font-heading text-white text-base leading-tight mb-1">{habit.name}</h3>
          <p className="text-xs text-casino-text-tertiary mb-1 line-clamp-1">{habit.description}</p>
          {(habit.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(habit.tags || []).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-casino-text-tertiary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4 text-xs text-casino-text-tertiary">
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-casino-text-secondary" />
              <span className="tabular-nums">{habit.completedDates.length} total</span>
            </div>
            {streak > 1 && (
              <motion.div
                className="flex items-center gap-1 text-casino-warning"
                animate={hasStreak ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame size={12} />
                <span className="font-bold tabular-nums">{streak} day streak</span>
              </motion.div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span className={styles.staleText ? 'text-casino-text-tertiary/50' : ''}>{lastText}</span>
            </div>
          </div>

          {/* Complete button */}
          <motion.button
            onClick={() => onComplete(habit)}
            data-tour="habit-list"
            whileTap={{ scale: 0.93 }}
            className="btn-pill w-full py-2.5 text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
              color: '#fff',
              boxShadow: `0 2px 12px ${habit.color}40`,
            }}
          >
            <Check size={15} />
            Complete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HabitList({ habits, jars, tags, onComplete, onEdit, onDelete, onAdd, onQuickTask }) {
  const [activeTag, setActiveTag] = useState(null);
  const weeklyTotal = getWeeklyCompletions(habits);
  const filtered = activeTag ? habits.filter((h) => (h.tags || []).includes(activeTag)) : habits;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">Your Habits</p>
          <span className="glass px-2 py-0.5 rounded-full text-xs text-casino-text-tertiary tabular-nums">{habits.length} habits</span>
          <span className="glass px-2 py-0.5 rounded-full text-xs text-casino-text-tertiary tabular-nums">{weeklyTotal} this week</span>
        </div>
        <button onClick={onAdd} data-tour="add-habit" className="btn-pill btn-ghost text-xs font-semibold flex items-center gap-1.5">
          <PlusIcon size={14} /> Add Habit
        </button>
      </div>

      {/* Tag filter bar */}
      {tags && tags.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${!activeTag ? 'bg-casino-accent text-black' : 'glass text-casino-text-tertiary hover:text-casino-text-secondary'}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${activeTag === tag ? 'bg-casino-accent text-black' : 'glass text-casino-text-tertiary hover:text-casino-text-secondary'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Quick Log CTA — full-width gold strip */}
      {onQuickTask && (
        <motion.button
          onClick={onQuickTask}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-float gold-foil w-full py-3 px-4 mb-4 flex items-center gap-3 rounded-2xl text-left transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(232,185,49,0.15)' }}>
            <Zap size={18} className="text-casino-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Quick Log</p>
            <p className="text-xs text-casino-text-tertiary">Did something? Log it — no habit setup needed</p>
          </div>
          <div className="w-5 h-5 rounded-full bg-casino-accent/20 flex items-center justify-center shrink-0">
            <Zap size={11} className="text-casino-accent" />
          </div>
        </motion.button>
      )}

      {habits.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 text-center rounded-2xl">
          <motion.div className="empty-float text-4xl mb-4">🎯</motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-casino-text-secondary text-sm mb-1">No habits yet</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-casino-text-tertiary text-xs mb-5">Create one to start earning clips</motion.p>
          <motion.button onClick={onAdd} data-tour="add-habit" className="btn-pill btn-gold text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Create your first habit
          </motion.button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((habit, index) => {
              const jar = jars.find((j) => j.id === habit.jarId);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  jar={jar}
                  index={index}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

function PlusIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}
