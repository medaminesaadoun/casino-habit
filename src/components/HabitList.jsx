import React from 'react';
import { motion } from 'framer-motion';
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

function HabitCard({ habit, jar, onComplete, onEdit, onDelete }) {
  const streak = getStreak(habit.completedDates);
  const lastText = getLastCompletedText(habit.completedDates);

  return (
    <motion.div
      layout
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="flex">
        {/* Left accent bar */}
        <div className="w-[3px] shrink-0 rounded-l-2xl" style={{ backgroundColor: habit.color }} />
        <div className="flex-1 p-4">
          {/* Top row: color indicator + actions */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: habit.color, boxShadow: `0 0 8px ${habit.color}50` }}
              />
              {jar && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: jar.color + '20',
                    color: jar.color,
                  }}
                >
                  {jar.name}
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(habit.id)}
                className="p-1.5 rounded-lg text-casino-text-tertiary hover:text-casino-danger hover:bg-white/5 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Name + desc */}
          <h3 className="font-semibold text-white text-base leading-tight mb-1">{habit.name}</h3>
          <p className="text-xs text-casino-text-tertiary mb-3 line-clamp-1">{habit.description}</p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4 text-xs text-casino-text-tertiary">
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-casino-text-secondary" />
              <span className="tabular-nums">{habit.completedDates.length} total</span>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 text-casino-warning">
                <Flame size={12} />
                <span className="font-bold tabular-nums">{streak} day streak</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{lastText}</span>
            </div>
          </div>

          {/* Complete button */}
          <button
            onClick={() => onComplete(habit)}
            className="btn-pill w-full py-2.5 text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
              color: '#fff',
              boxShadow: `0 2px 12px ${habit.color}40`,
            }}
          >
            <Check size={15} />
            Complete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HabitList({ habits, jars, onComplete, onEdit, onDelete, onAdd }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Your Habits</p>
        <button onClick={onAdd} className="btn-pill btn-ghost text-xs font-semibold flex items-center gap-1.5">
          <PlusIcon size={14} /> Add Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="glass p-10 text-center rounded-2xl">
          <p className="text-casino-text-secondary text-sm mb-2">No habits yet</p>
          <button onClick={onAdd} className="btn-pill btn-gold text-sm">
            Create your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const jar = jars.find((j) => j.id === habit.jarId);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                jar={jar}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
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