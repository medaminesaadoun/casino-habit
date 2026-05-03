import React from 'react';
import { motion } from 'framer-motion';
import { Dices, ListTodo, Trophy, Clock, Gift } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'wheel', label: 'Wheel', icon: Dices },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'jars', label: 'Jars', icon: Trophy },
  { id: 'history', label: 'History', icon: Clock },
];

export default function TopNav({ active, onChange, unseenRewards }) {
  return (
    <nav className="hidden lg:flex items-center gap-1 mb-8 glass rounded-xl p-1.5 sticky top-4 z-30">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg flex-1 justify-center z-10 transition-colors font-heading ${
              isActive ? 'text-casino-accent' : 'text-casino-text-tertiary hover:text-casino-text-secondary'
            }`}
            {...(item.id === 'jars' ? { 'data-tour': 'jars-tab' } : {})}
          >
            {isActive && (
              <motion.span
                layoutId="topnav-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  boxShadow: '0 0 20px color-mix(in srgb, var(--color-casino-accent) 12%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
                  border: '1px solid color-mix(in srgb, var(--color-casino-accent) 20%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-sm font-semibold relative z-10 tracking-tight">{item.label}</span>
            {item.id === 'rewards' && unseenRewards > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center z-20 badge-pulse"
                style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
              >
                {unseenRewards > 9 ? '9+' : unseenRewards}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
