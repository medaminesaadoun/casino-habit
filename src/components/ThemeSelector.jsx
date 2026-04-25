import React from 'react';
import { motion } from 'framer-motion';
import { X, Orbit } from 'lucide-react';

const THEMES = [
  { id: 'blue', name: 'Gold Rush', color: '#e8b931', desc: 'Warm gold on dark' },
  { id: 'purple', name: 'Neon Violet', color: '#c084fc', desc: 'Purple glow aesthetic' },
  { id: 'black', name: 'Rose Gold', color: '#d4a574', desc: 'Elegant warm tones' },
];

export default function ThemeSelector({ currentTheme, onSelect, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Orbit size={20} className="text-casino-accent" />
            <h2 className="text-lg font-bold text-white">Theme</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                currentTheme === theme.id ? 'border-white/15 bg-white/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.color}80)`, boxShadow: `0 0 16px ${theme.color}30` }} />
              <div className="text-left flex-1">
                <div className="font-semibold text-white text-sm">{theme.name}</div>
                <div className="text-xs text-casino-text-tertiary">{theme.desc}</div>
              </div>
              {currentTheme === theme.id && (
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: theme.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}