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

export default function BottomNav({ active, onChange, unseenRewards }) {
  return (
    <nav className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl glass" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
                isActive ? 'text-casino-accent' : 'text-casino-text-tertiary'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="botnav-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-casino-accent) 15%, transparent), color-mix(in srgb, var(--color-casino-accent) 5%, transparent))',
                    boxShadow: '0 0 16px color-mix(in srgb, var(--color-casino-accent) 15%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.id === 'rewards' && unseenRewards > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center badge-pulse"
                    style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                  >
                    {unseenRewards > 9 ? '9+' : unseenRewards}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-semibold relative z-10 font-heading tracking-tight ${isActive ? 'text-casino-accent' : ''}`}>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
