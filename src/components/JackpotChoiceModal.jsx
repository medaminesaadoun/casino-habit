import React from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Zap, Lock, CloudRain } from 'lucide-react';

const CHOICES = [
  {
    key: 'double-up',
    title: 'Double-Up',
    description: 'Claim two Tier 3 rewards immediately',
    icon: Gift,
    color: '#a855f7',
  },
  {
    key: 'chain-reaction',
    title: 'Chain Reaction',
    description: 'Tier 3 reward plus a free Bonus Wheel',
    icon: Zap,
    color: '#eab308',
  },
  {
    key: 'the-lock',
    title: 'The Lock',
    description: 'Tier 3 now, plus your next spin is a guaranteed Jackpot',
    icon: Lock,
    color: '#e8b931',
  },
  {
    key: 'rainmaker',
    title: 'The Rainmaker',
    description: 'Tier 3 now, plus your next 6 habits pay double tokens',
    icon: CloudRain,
    color: '#3b82f6',
  },
];

export default function JackpotChoiceModal({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="modal-panel text-center relative overflow-hidden max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: '#e8b931' }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3"
          style={{ backgroundColor: '#e8b93115', color: '#e8b931', boxShadow: '0 0 16px #e8b93120' }}
        >
          <Zap size={12} /> JACKPOT!
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl font-bold text-white mb-1"
        >
          Choose Your Destiny
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-casino-text-tertiary mb-6"
        >
          Select one reward for your Mega Spin Jackpot
        </motion.p>

        <div className="grid grid-cols-2 gap-3">
          {CHOICES.map((choice, idx) => {
            const Icon = choice.icon;
            return (
              <motion.button
                key={choice.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.08 }}
                onClick={() => onSelect(choice.key)}
                className="jackpot-choice-card relative flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: choice.color + '18', color: choice.color }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{choice.title}</p>
                  <p className="text-xs text-casino-text-secondary leading-snug">{choice.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
