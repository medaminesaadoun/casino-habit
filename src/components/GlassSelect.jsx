import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function GlassSelect({ value, onChange, options, placeholder = 'Select...', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex items-center justify-between cursor-pointer"
      >
        <span className={selected ? 'text-casino-text' : 'text-casino-text-tertiary'}>{display}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 mt-1 w-full rounded-xl p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(30,30,35,0.98) 0%, rgba(18,18,20,0.98) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => { onChange(option.value); setOpen(false); }}
                whileTap={{ scale: 0.97 }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  option.value === value
                    ? 'text-casino-accent font-semibold'
                    : 'text-casino-text-secondary hover:text-casino-text hover:bg-white/5'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
