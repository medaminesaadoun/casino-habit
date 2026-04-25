import React from 'react';
import { Dices, ListTodo, Trophy, Clock, Gift } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'wheel', label: 'Wheel', icon: Dices },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'jars', label: 'Jars', icon: Trophy },
  { id: 'history', label: 'History', icon: Clock },
];

export default function TopNav({ active, onChange }) {
  return (
    <nav className="hidden lg:flex items-center gap-1 mb-6 glass rounded-2xl p-1.5 sticky top-4 z-30">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all flex-1 justify-center ${
              isActive
                ? 'text-casino-accent font-semibold'
                : 'text-casino-text-tertiary hover:text-casino-text-secondary'
            }`}
            style={
              isActive
                ? {
                    background: 'rgba(255,255,255,0.06)',
                    borderBottom: '2px solid var(--color-casino-accent)',
                  }
                : { borderBottom: '2px solid transparent' }
            }
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
