import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

const TIER_NAMES = { tier1: 'Tier 1 (Small)', tier2: 'Tier 2 (Medium)', tier3: 'Tier 3 (Large)', jackpot: 'Jackpot (Epic)' };
const TIER_COLORS = { tier1: '#ef4444', tier2: '#3b82f6', tier3: '#a855f7', jackpot: '#e8b931' };

export default function RewardCatalog({ catalog, onSave, onClose }) {
  const [localCatalog, setLocalCatalog] = useState(catalog);
  const [newCustoms, setNewCustoms] = useState({ tier1: '', tier2: '', tier3: '', jackpot: '' });
  const [newIcons, setNewIcons] = useState({ tier1: '🎁', tier2: '🎁', tier3: '🎁', jackpot: '🎁' });

  const toggleReward = (tier, rewardId) => {
    setLocalCatalog((prev) => ({ ...prev, [tier]: prev[tier].map((r) => r.id === rewardId ? { ...r, enabled: !r.enabled } : r) }));
  };
  const deleteCustom = (tier, rewardId) => {
    setLocalCatalog((prev) => ({ ...prev, [tier]: prev[tier].filter((r) => r.id !== rewardId) }));
  };
  const addCustom = (tier) => {
    const name = newCustoms[tier].trim();
    if (!name) return;
    setLocalCatalog((prev) => ({ ...prev, [tier]: [...(prev[tier] || []), { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, name, icon: newIcons[tier] || '🎁', enabled: true, custom: true }] }));
    setNewCustoms((prev) => ({ ...prev, [tier]: '' }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-panel max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Reward Catalog</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-casino-text-tertiary mb-5">Toggle rewards on/off. Custom rewards can be deleted.</p>

        {Object.entries(TIER_NAMES).map(([tierKey, tierLabel]) => (
          <div key={tierKey} className="mb-5">
            <h3 className="text-xs font-bold mb-2" style={{ color: TIER_COLORS[tierKey] }}>{tierLabel}</h3>
            <div className="space-y-1.5 mb-2">
              {(localCatalog[tierKey] || []).map((reward) => (
                <div key={reward.id} className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${reward.enabled ? 'border-white/8 bg-white/3' : 'border-white/3 bg-white/1 opacity-40'}`}>
                  <span className="text-base">{reward.icon}</span>
                  <span className="flex-1 text-xs font-medium text-white">{reward.name}</span>
                  <button onClick={() => toggleReward(tierKey, reward.id)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${reward.enabled ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-casino-text-tertiary'}`}>{reward.enabled ? 'ON' : 'OFF'}</button>
                  {reward.custom && <button onClick={() => deleteCustom(tierKey, reward.id)} className="p-0.5 text-casino-text-tertiary hover:text-casino-danger transition-colors"><Trash2 size={12} /></button>}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input type="text" value={newIcons[tierKey]} onChange={(e) => setNewIcons((prev) => ({ ...prev, [tierKey]: e.target.value }))} className="w-9 bg-white/5 border border-white/10 rounded-xl text-center text-sm py-1.5 focus:outline-none focus:border-casino-accent" maxLength={2} />
              <input type="text" value={newCustoms[tierKey]} onChange={(e) => setNewCustoms((prev) => ({ ...prev, [tierKey]: e.target.value }))} placeholder="Add custom reward..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-casino-accent" onKeyDown={(e) => e.key === 'Enter' && addCustom(tierKey)} />
              <button onClick={() => addCustom(tierKey)} className="btn-pill btn-glass px-3 py-1.5 text-xs"><Plus size={14} /></button>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-pill btn-glass flex-1">Cancel</button>
          <button onClick={() => onSave(localCatalog)} className="btn-pill btn-gold flex-1">Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}