import React from 'react';
import { Dices, ListTodo, Trophy, Clock, Gift } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'wheel', label: 'Wheel', icon: Dices },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'jars', label: 'Jars', icon: Trophy },
  { id: 'history', label: 'History', icon: Clock },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl glass" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'text-casino-accent' : 'text-casino-text-tertiary'
              }`}
              style={isActive ? { background: 'rgba(255,255,255,0.06)' } : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-casino-accent' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}