import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Calendar } from 'lucide-react';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DoneToday({ habits, jars, history }) {
  const today = getToday();

  const habitEntries = habits
    .filter((h) => (h.completedDates || []).some((d) => d.startsWith(today)))
    .map((h) => {
      const lastDate = h.completedDates.filter((d) => d.startsWith(today)).pop();
      const jar = jars.find((j) => j.id === h.jarId);
      return { id: h.id, name: h.name, time: lastDate, type: 'habit', jar };
    });

  const quickEntries = (history || [])
    .filter((h) => h.type === 'quick-task' && h.timestamp.startsWith(today))
    .map((h) => ({
      id: h.id,
      name: h.habitName,
      time: h.timestamp,
      type: 'quick',
      jar: jars.find((j) => j.id === h.jarId),
    }));

  const done = [...habitEntries, ...quickEntries].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  return (
    <div className="glass p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-casino-accent" />
        <h3 className="font-heading text-sm text-white tracking-tight">Done Today</h3>
        <span className="text-[10px] text-casino-text-tertiary tabular-nums ml-auto">{done.length}</span>
      </div>
      {done.length === 0 ? (
        <p className="text-xs text-casino-text-tertiary text-center py-2">Nothing done yet today</p>
      ) : (
        <div className="space-y-1">
          {done.slice(0, 10).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-casino-card/50"
            >
              <div className="w-4 h-4 rounded-md border-2 border-casino-success/40 bg-casino-success/10 flex items-center justify-center shrink-0">
                {entry.type === 'quick' ? (
                  <Zap size={9} className="text-casino-warning" />
                ) : (
                  <Check size={10} className="text-casino-success" />
                )}
              </div>
              <span className="flex-1 text-xs text-casino-text-secondary truncate">{entry.name}</span>
              <span className="text-[10px] text-casino-text-tertiary tabular-nums">{formatTime(entry.time)}</span>
              {entry.jar && (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.jar.color }} />
              )}
              {entry.type === 'quick' && (
                <span className="text-[8px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-casino-warning/10 text-casino-warning/60">Quick</span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
