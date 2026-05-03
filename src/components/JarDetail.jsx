import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Zap, Gem } from 'lucide-react';
import { playClink } from '../sounds';
import { SingleClip } from './ClipInventory';

/* ===== HELPERS ===== */

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

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};

const HEX_TO_CLIP = {
  '#ef4444': 'red', '#3b82f6': 'blue', '#22c55e': 'green',
  '#eab308': 'yellow', '#a855f7': 'purple', '#f97316': 'orange', '#e8b931': 'gold',
};

/* ===== MINI CLIP FOR INSIDE JAR ===== */

function MiniClip({ color, rotation, depth, left, bottom }) {
  const s = depth === 'back' ? 0.35 : depth === 'middle' ? 0.5 : 0.7;
  const opacity = depth === 'back' ? 0.35 : depth === 'middle' ? 0.6 : 0.85;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        bottom,
        marginLeft: -22 * s,
        transform: `rotate(${rotation}deg) scale(${s})`,
        transformOrigin: 'bottom center',
        opacity,
        zIndex: depth === 'front' ? 5 : depth === 'middle' ? 3 : 1,
        pointerEvents: 'none',
      }}
    >
      <SingleClip color={color} />
    </div>
  );
}

/* ===== DROP CLIP (falling animation) ===== */

function DropClip({ color }) {
  const s = 0.7;
  return (
    <div style={{ position: 'relative', width: 44, height: 40, marginLeft: -22 * s, transform: `scale(${s})`, transformOrigin: 'bottom center' }}>
      <SingleClip color={color} />
    </div>
  );
}

/* ===== PILE GENERATOR ===== */

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePile(cashedClips, fillPercent, bodyW, bodyH) {
  if (!cashedClips || cashedClips.length === 0) return [];

  const maxVisible = 80;
  const sampleSize = Math.min(cashedClips.length, maxVisible);

  // Proportional sampling by color to preserve the actual mix
  const colorCounts = {};
  cashedClips.forEach((c) => {
    colorCounts[c] = (colorCounts[c] || 0) + 1;
  });
  const total = cashedClips.length;
  const colors = Object.keys(colorCounts);

  const sampled = [];
  colors.forEach((color) => {
    const count = colorCounts[color];
    const target = Math.max(1, Math.round((count / total) * sampleSize));
    const indices = [];
    for (let i = 0; i < cashedClips.length; i++) {
      if (cashedClips[i] === color) indices.push(i);
    }
    const step = Math.max(1, Math.floor(indices.length / target));
    for (let i = 0; i < target && i * step < indices.length; i++) {
      sampled.push(cashedClips[indices[i * step]]);
    }
  });

  while (sampled.length > maxVisible) sampled.pop();
  let idx = 0;
  while (sampled.length < sampleSize) {
    sampled.push(cashedClips[idx % cashedClips.length]);
    idx++;
  }

  const fillHeight = Math.max(bodyH * 0.12, bodyH * (fillPercent / 100));
  const rand = seededRandom(cashedClips.length);

  return sampled.map((color, i) => {
    const t = (i + 0.5) / sampled.length; // 0 = bottom, 1 = top
    // Cluster heavily toward bottom (natural pile)
    const yNorm = Math.pow(t, 1.7);
    const bottom = 4 + yNorm * (fillHeight - 8);

    // Spread narrows toward bottom (pyramid shape)
    const spreadFactor = 0.35 + 0.65 * yNorm;
    const left = bodyW / 2 + (rand() - 0.5) * (bodyW * 0.65 * spreadFactor);

    const rotation = (rand() - 0.5) * 70;

    // Depth: lower clips = back, higher = front
    const depth = yNorm < 0.35 ? 'back' : yNorm < 0.7 ? 'middle' : 'front';

    return {
      color,
      left,
      bottom,
      rotation,
      depth,
      key: `clip-${i}`,
    };
  });
}

/* ===== MILESTONE RING ===== */

function MilestoneRing({ milestone, index, jar, prevTarget }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const target = milestone.target;
  const achieved = jar.totalClips >= target;
  const progress = achieved
    ? 1
    : jar.totalClips <= prevTarget
    ? 0
    : Math.min((jar.totalClips - prevTarget) / (target - prevTarget), 1);
  const offset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.08, type: 'spring', stiffness: 300 }}
      className="flex items-center gap-3"
    >
      <div className="relative shrink-0" style={{ width: radius * 2 + 8, height: radius * 2 + 8 }}>
        <svg width={radius * 2 + 8} height={radius * 2 + 8} className="-rotate-90">
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke={achieved ? jar.color : jar.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: achieved ? `drop-shadow(0 0 4px ${jar.color}80)` : 'none',
              opacity: achieved ? 1 : 0.5,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {achieved ? (
            <Gem size={14} style={{ color: jar.color }} />
          ) : (
            <span className="text-[9px] font-bold text-casino-text-tertiary tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold tabular-nums ${achieved ? 'text-white' : 'text-casino-text-secondary'}`}>
            {milestone.target.toLocaleString()}
          </span>
          {achieved && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-casino-success">Achieved</span>
          )}
        </div>
        <p className={`text-[11px] truncate ${achieved ? 'text-casino-text-tertiary' : 'text-casino-text-tertiary/50'}`}>
          {milestone.reward}
        </p>
        {!achieved && progress > 0 && (
          <p className="text-[10px] text-casino-text-tertiary/40 tabular-nums">
            {jar.totalClips.toLocaleString()} / {milestone.target.toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ===== MAIN COMPONENT ===== */

export default function JarDetail({ jar, habits, history, onBack, onEdit, onDelete }) {
  const maxTarget = jar.milestones[jar.milestones.length - 1]?.target || 10000;
  const fillPercent = Math.min((jar.totalClips / maxTarget) * 100, 100);

  const fallbackColor = HEX_TO_CLIP[jar.color] || 'red';

  const pile = useMemo(
    () => generatePile(jar.cashedClips || [], fillPercent, 170, 240),
    [jar.cashedClips?.length, fillPercent]
  );

  /* Drop-in animation state */
  const [dropClips, setDropClips] = useState([]);
  const prevTotalRef = useRef(jar.totalClips);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevTotalRef.current = jar.totalClips;
      return;
    }
    if (jar.totalClips > prevTotalRef.current) {
      const diff = jar.totalClips - prevTotalRef.current;
      const count = Math.min(diff, 4);
      const newDrops = Array.from({ length: count }, (_, i) => ({
        id: `drop-${Date.now()}-${i}`,
        color: jar.cashedClips?.[jar.cashedClips.length - count + i] || fallbackColor,
        delay: i * 0.12,
        targetX: 30 + Math.random() * 110,
        targetY: 50 + Math.random() * 100,
      }));
      setDropClips((prev) => [...prev, ...newDrops]);
      playClink();
      setTimeout(() => {
        setDropClips((prev) => prev.filter((d) => !newDrops.find((nd) => nd.id === d.id)));
      }, 2000);
    }
    prevTotalRef.current = jar.totalClips;
  }, [jar.totalClips, jar.cashedClips, fallbackColor]);

  const connectedHabits = useMemo(
    () => habits.filter((h) => h.jarId === jar.id),
    [habits, jar.id]
  );

  const jarHistory = useMemo(() => {
    const habitIds = new Set(connectedHabits.map((h) => h.id));
    return history
      .filter(
        (h) =>
          h.jarId === jar.id ||
          (h.habitId && habitIds.has(h.habitId))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }, [history, jar.id, connectedHabits]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-casino-text-secondary hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          All Jars
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        {/* Left — Giant Jar with Clip Pile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 flex flex-col items-center justify-center relative"
        >
          {/* Colored glow behind jar */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: jar.color }}
          />

          {/* Giant Jar */}
          <div className="jar-visual-xl relative z-10">
            {/* Falling drops */}
            <AnimatePresence>
              {dropClips.map((drop) => (
                <motion.div
                  key={drop.id}
                  className="absolute"
                  style={{ left: drop.targetX, top: 20, zIndex: 20 }}
                  initial={{ y: -40, opacity: 0, scale: 0.3 }}
                  animate={{
                    y: drop.targetY,
                    opacity: [0, 1, 1, 0],
                    scale: [0.3, 1.15, 1, 0.85],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: drop.delay,
                    type: 'spring',
                    stiffness: 240,
                    damping: 14,
                  }}
                >
                  <DropClip color={drop.color} />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="jar-lid" />
            <div className="jar-neck" />
            <div className="jar-body relative overflow-hidden">
              {/* Clip pile */}
              {pile.map((clip) => (
                <MiniClip
                  key={clip.key}
                  color={clip.color}
                  left={clip.left}
                  bottom={clip.bottom}
                  rotation={clip.rotation}
                  depth={clip.depth}
                />
              ))}

              {/* Count overlay */}
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

          <h2 className="mt-6 text-lg font-heading text-white text-center">{jar.name}</h2>
          <p className="text-sm text-casino-text-secondary tabular-nums mt-1">
            {jar.totalClips.toLocaleString()}{' '}
            <span className="text-casino-text-tertiary">/ {maxTarget.toLocaleString()}</span>
          </p>
          <p className="text-xs text-casino-text-tertiary mt-0.5">{Math.round(fillPercent)}% full</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(jar)}
              className="btn-pill btn-ghost text-xs flex items-center gap-1.5"
            >
              Edit Jar
            </button>
            <button
              onClick={() => onDelete(jar.id)}
              className="btn-pill btn-ghost text-xs flex items-center gap-1.5 text-casino-danger hover:text-casino-danger"
            >
              Delete
            </button>
          </div>
        </motion.div>

        {/* Right — Milestones + Habits + Activity */}
        <div className="space-y-4">
          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5"
          >
            <p className="font-heading text-sm text-white mb-4 tracking-tight">Milestones</p>
            <div className="space-y-3">
              {jar.milestones.map((m, idx) => (
                <MilestoneRing
                  key={idx}
                  milestone={m}
                  index={idx}
                  jar={jar}
                  prevTarget={idx > 0 ? jar.milestones[idx - 1].target : 0}
                />
              ))}
            </div>
          </motion.div>

          {/* Connected Habits */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass p-5"
          >
            <p className="font-heading text-sm text-white mb-3 tracking-tight">Connected Habits</p>
            {connectedHabits.length === 0 ? (
              <p className="text-xs text-casino-text-tertiary py-2">No habits linked to this jar yet.</p>
            ) : (
              <div className="space-y-2">
                {connectedHabits.map((habit) => {
                  const streak = getStreak(habit.completedDates);
                  const lastText = getLastCompletedText(habit.completedDates);
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl bg-casino-card"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: habit.color,
                          boxShadow: `0 0 6px ${habit.color}60`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{habit.name}</p>
                        <p className="text-[10px] text-casino-text-tertiary">{lastText}</p>
                      </div>
                      {streak > 1 && (
                        <div className="flex items-center gap-1 text-casino-warning">
                          <Flame size={10} />
                          <span className="text-[10px] font-bold tabular-nums">{streak}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-casino-text-tertiary">
                        <Zap size={10} />
                        <span className="text-[10px] tabular-nums">{habit.completedDates.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-5"
          >
            <p className="font-heading text-sm text-white mb-3 tracking-tight">Recent Activity</p>
            {jarHistory.length === 0 ? (
              <p className="text-xs text-casino-text-tertiary py-2">No activity for this jar yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {jarHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-casino-card text-sm"
                  >
                    <span className="text-casino-text-tertiary text-[10px] tabular-nums shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.type === 'habit' || item.type === 'quick-task' ? (
                      <span className="flex-1 mx-3 text-casino-text text-xs">
                        Completed <span className="font-semibold">{item.habitName}</span>
                      </span>
                    ) : item.type === 'reward-claimed' ? (
                      <span className="flex-1 mx-3 text-casino-text text-xs">
                        Claimed <span className="font-semibold text-casino-success">{item.rewardName}</span>
                      </span>
                    ) : item.type === 'reward-completed' ? (
                      <span className="flex-1 mx-3 text-casino-text text-xs">
                        Finished <span className="font-semibold text-casino-accent">{item.rewardName}</span>
                      </span>
                    ) : (
                      <span className="flex-1 mx-3 text-casino-text text-xs">
                        Wheel → <span className="font-semibold">{item.result}</span>
                      </span>
                    )}
                    <span className="text-[9px] text-casino-text-tertiary uppercase tracking-wider shrink-0">
                      {item.type === 'quick-task' ? 'Quick' : item.type === 'habit' ? 'Habit' : item.type === 'reward-claimed' ? 'Claimed' : item.type === 'reward-completed' ? 'Done' : 'Spin'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
