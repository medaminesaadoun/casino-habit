import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

const TIER_NAMES = { tier1: 'T1 — 5-15 min', tier2: 'T2 — 20-45 min', tier3: 'T3 — 45-90 min', jackpot: 'Jackpot — 2h-4h+' };
const TIER_COLORS = { tier1: '#ef4444', tier2: '#3b82f6', tier3: '#a855f7', jackpot: '#e8b931' };
const TIER_DEFAULTS = {
  tier1: { grace: 0, duration: 10 },
  tier2: { grace: 0, duration: 30 },
  tier3: { grace: 0, duration: 60 },
  jackpot: { grace: 0, duration: 120 },
};
const SIMPLE_REWARDS = {
  tier1: [
    { id: 'simple-t1-1', name: 'Quick pause', icon: '⏱️', duration: 5 },
    { id: 'simple-t1-2', name: 'Short break', icon: '⏱️', duration: 10 },
    { id: 'simple-t1-3', name: 'Extended break', icon: '⏱️', duration: 15 },
  ],
  tier2: [
    { id: 'simple-t2-1', name: 'Free time', icon: '⏱️', duration: 20 },
    { id: 'simple-t2-2', name: 'Half hour', icon: '⏱️', duration: 30 },
    { id: 'simple-t2-3', name: 'Long break', icon: '⏱️', duration: 45 },
  ],
  tier3: [
    { id: 'simple-t3-1', name: 'Free time', icon: '⏱️', duration: 45 },
    { id: 'simple-t3-2', name: 'Free hour', icon: '⏱️', duration: 60 },
    { id: 'simple-t3-3', name: 'Extended', icon: '⏱️', duration: 90 },
  ],
  jackpot: [
    { id: 'simple-jp-1', name: 'Me time', icon: '⏱️', duration: 120 },
    { id: 'simple-jp-2', name: 'Half day', icon: '⏱️', duration: 180 },
    { id: 'simple-jp-3', name: 'Day off', icon: '⏱️', duration: 240 },
  ],
};
const SUGGESTIONS = {
  tier1: [
    { e: '☕', t: 'Make fancy coffee' },
    { e: '🍿', t: 'Guilt-free YouTube' },
    { e: '📱', t: 'Social media break' },
    { e: '🎵', t: 'One full album' },
    { e: '💤', t: 'Power nap' },
    { e: '🛁', t: 'Quick shower reward' },
  ],
  tier2: [
    { e: '🎮', t: 'Game session (30 min)' },
    { e: '📺', t: 'Two episodes' },
    { e: '🛁', t: 'Long bath + podcast' },
    { e: '🍕', t: 'Cook favorite meal' },
    { e: '🎧', t: 'Deep listening session' },
    { e: '📖', t: 'Read a chapter' },
  ],
  tier3: [
    { e: '🎬', t: 'Movie marathon' },
    { e: '🎨', t: 'Paint or draw afternoon' },
    { e: '🎲', t: 'Board game night' },
    { e: '🍳', t: 'Cook fancy meal' },
    { e: '🛋️', t: 'Complete lazy day' },
    { e: '📚', t: 'Read for hours' },
  ],
  jackpot: [
    { e: '🎬', t: 'Movie trilogy marathon' },
    { e: '🎮', t: 'All-day gaming pass' },
    { e: '🛋️', t: 'Do Not Disturb day' },
    { e: '🍳', t: 'MasterChef edition' },
    { e: '🛁', t: 'Spa day at home' },
    { e: '🎨', t: 'Creative deep dive' },
  ],
};
const EMOJI_GRID = [
  '🎁', '🎮', '📺', '☕', '🍿', '🎵', '💤', '🛁',
  '🍕', '🎧', '📖', '🎬', '🎨', '🎲', '🍳', '🛋️',
  '📚', '📱', '🎉', '🎰', '🍩', '💆', '🛒', '🏖️', '✈️',
];

function formatDuration(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${min}m`;
}

export default function RewardCatalog({ catalog, onSave, onClose }) {
  const [localCatalog, setLocalCatalog] = useState(catalog);
  const [isSimple, setIsSimple] = useState(true);
  const [newCustoms, setNewCustoms] = useState({ tier1: '', tier2: '', tier3: '', jackpot: '' });
  const [newIcons, setNewIcons] = useState({ tier1: '🎁', tier2: '🎁', tier3: '🎁', jackpot: '🎁' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  // Auto-fill simple defaults on mount if catalog is empty
  useEffect(() => {
    if (isSimple) applySimpleDefaults();
  }, []); // eslint-disable-line

  const switchToSimple = () => {
    setIsSimple(true);
    applySimpleDefaults();
  };

  const applySimpleDefaults = () => {
    setLocalCatalog((prev) => ({
      ...prev,
      tier1: (prev.tier1 || []).length === 0
        ? SIMPLE_REWARDS.tier1.map((r) => ({ ...r, enabled: true, custom: true, gracePeriodMinutes: 0 }))
        : prev.tier1,
      tier2: (prev.tier2 || []).length === 0
        ? SIMPLE_REWARDS.tier2.map((r) => ({ ...r, enabled: true, custom: true, gracePeriodMinutes: 0 }))
        : prev.tier2,
      tier3: (prev.tier3 || []).length === 0
        ? SIMPLE_REWARDS.tier3.map((r) => ({ ...r, enabled: true, custom: true, gracePeriodMinutes: 0 }))
        : prev.tier3,
      jackpot: (prev.jackpot || []).length === 0
        ? SIMPLE_REWARDS.jackpot.map((r) => ({ ...r, enabled: true, custom: true, gracePeriodMinutes: 0 }))
        : prev.jackpot,
    }));
  };

  const toggleReward = (tier, rewardId) => {
    setLocalCatalog((prev) => ({ ...prev, [tier]: prev[tier].map((r) => (r.id === rewardId ? { ...r, enabled: !r.enabled } : r)) }));
  };

  const updateTimer = (tier, rewardId, field, value) => {
    const num = parseInt(value) || 0;
    setLocalCatalog((prev) => ({ ...prev, [tier]: prev[tier].map((r) => (r.id === rewardId ? { ...r, [field]: Math.max(1, num) } : r)) }));
  };

  const deleteCustom = (tier, rewardId) => {
    setLocalCatalog((prev) => ({ ...prev, [tier]: prev[tier].filter((r) => r.id !== rewardId) }));
  };

  const addCustom = (tier) => {
    const name = newCustoms[tier].trim();
    if (!name) return;
    const defaults = TIER_DEFAULTS[tier];
    setLocalCatalog((prev) => ({
      ...prev,
      [tier]: [...(prev[tier] || []), {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name,
        icon: newIcons[tier] || '🎁',
        enabled: true,
        custom: true,
        gracePeriodMinutes: defaults.grace,
        durationMinutes: defaults.duration,
      }],
    }));
    setNewCustoms((prev) => ({ ...prev, [tier]: '' }));
    setShowEmojiPicker(null);
  };

  const applySuggestion = (tier, suggestion) => {
    setNewIcons((prev) => ({ ...prev, [tier]: suggestion.e }));
    setNewCustoms((prev) => ({ ...prev, [tier]: suggestion.t }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-panel max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Reward Catalog</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-casino-text-tertiary mb-3">
          {isSimple
            ? 'Time-based rewards. Each tier has built-in luck — you might get a shorter or longer break.' 
            : 'Full control — toggle, edit timers, add your own rewards.'}
        </p>

        {/* Simple / Custom toggle */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={switchToSimple}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isSimple ? 'bg-casino-accent text-black' : 'glass text-casino-text-tertiary hover:text-casino-text-secondary'}`}
          >
            Simple
          </button>
          <button
            onClick={() => setIsSimple(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!isSimple ? 'bg-casino-accent text-black' : 'glass text-casino-text-tertiary hover:text-casino-text-secondary'}`}
          >
            Custom
          </button>
        </div>

        {/* SIMPLE MODE — tier cards with chip previews */}
        {isSimple && (
          <div className="space-y-4">
            {Object.entries(TIER_NAMES).map(([tierKey, tierLabel]) => {
              const rewards = localCatalog[tierKey] || [];
              if (rewards.length === 0) return null;
              const color = TIER_COLORS[tierKey];
              return (
                <motion.div
                  key={tierKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * Object.keys(TIER_NAMES).indexOf(tierKey) }}
                  className="glass p-4 relative overflow-hidden"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  {/* Ambient glow */}
                  <div
                    className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="text-xs font-bold mb-3" style={{ color }}>{tierLabel}</h3>
                  <div className="flex flex-wrap gap-2">
                    {rewards.map((reward, i) => (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs"
                      >
                        <span className="text-sm">{reward.icon}</span>
                        <span className="text-casino-text-secondary font-medium">{reward.name}</span>
                        <span className="text-casino-text-tertiary ml-1 tabular-nums">· {formatDuration(reward.durationMinutes ?? TIER_DEFAULTS[tierKey].duration)}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[11px] text-casino-text-tertiary text-center pt-1">Grace period disabled — timer starts immediately on claim</p>
          </div>
        )}

        {/* CUSTOM MODE — full controls */}
        {!isSimple && (
          <>
            {Object.entries(TIER_NAMES).map(([tierKey, tierLabel]) => (
              <div key={tierKey} className="mb-5">
                <h3 className="text-xs font-bold mb-2" style={{ color: TIER_COLORS[tierKey] }}>{tierLabel}</h3>
                <div className="space-y-2 mb-2">
                  {(localCatalog[tierKey] || []).map((reward) => (
                    <div key={reward.id} className={`p-2.5 rounded-xl border transition-colors ${reward.enabled ? 'border-white/8 bg-white/3' : 'border-white/3 bg-white/1 opacity-40'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{reward.icon}</span>
                        <span className="flex-1 text-xs font-medium text-white truncate">{reward.name}</span>
                        <button onClick={() => toggleReward(tierKey, reward.id)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${reward.enabled ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-casino-text-tertiary'}`}>
                          {reward.enabled ? 'ON' : 'OFF'}
                        </button>
                        {reward.custom && (
                          <button onClick={() => deleteCustom(tierKey, reward.id)} className="p-0.5 text-casino-text-tertiary hover:text-casino-danger transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 pl-7">
                        <span className="text-[10px] text-casino-text-tertiary w-10 shrink-0">Grace:</span>
                        <input type="number" min="0" max="60" value={reward.gracePeriodMinutes ?? TIER_DEFAULTS[tierKey].grace} onChange={(e) => updateTimer(tierKey, reward.id, 'gracePeriodMinutes', e.target.value)} className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white text-center focus:outline-none focus:border-casino-accent" />
                        <span className="text-[10px] text-casino-text-tertiary">min</span>
                        <span className="text-[10px] text-casino-text-tertiary w-14 shrink-0">Duration:</span>
                        <input type="number" min="1" max="480" value={reward.durationMinutes ?? TIER_DEFAULTS[tierKey].duration} onChange={(e) => updateTimer(tierKey, reward.id, 'durationMinutes', e.target.value)} className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white text-center focus:outline-none focus:border-casino-accent" />
                        <span className="text-[10px] text-casino-text-tertiary">min</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTIONS[tierKey].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => applySuggestion(tierKey, s)}
                      className="text-[10px] px-2.5 py-1 rounded-lg border border-white/8 bg-white/3 text-casino-text-secondary hover:border-casino-accent/30 hover:text-white transition-colors"
                    >
                      {s.e} {s.t}
                    </button>
                  ))}
                </div>

                {/* Custom add input */}
                <div className="flex gap-1.5">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(showEmojiPicker === tierKey ? null : tierKey)}
                      className="w-9 h-full bg-white/5 border border-white/10 rounded-xl text-center text-sm py-1.5 hover:border-casino-accent transition-colors"
                    >
                      {newIcons[tierKey]}
                    </button>
                    {showEmojiPicker === tierKey && (
                      <div className="absolute top-full left-0 mt-1 z-20 glass p-2 rounded-xl grid grid-cols-5 gap-1 w-[180px]">
                        {EMOJI_GRID.map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => { setNewIcons((prev) => ({ ...prev, [tierKey]: emoji })); setShowEmojiPicker(null); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-base transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="text" value={newCustoms[tierKey]} onChange={(e) => setNewCustoms((prev) => ({ ...prev, [tierKey]: e.target.value }))} placeholder="Add custom reward..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-casino-accent" onKeyDown={(e) => e.key === 'Enter' && addCustom(tierKey)} />
                  <button onClick={() => addCustom(tierKey)} className="btn-pill btn-glass px-3 py-1.5 text-xs"><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-pill btn-glass flex-1">Cancel</button>
          <button onClick={() => onSave(localCatalog)} className="btn-pill btn-gold flex-1">Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
