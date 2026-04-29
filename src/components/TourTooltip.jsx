import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TourTooltip({ step, total, title, description, targetSelector, onSkip }) {
  const [bounds, setBounds] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const els = document.querySelectorAll(`[data-tour="${targetSelector}"]`);
      // Find the first visible element (desktop vs mobile both have the attr)
      const el = Array.from(els).find((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (el) {
        const rect = el.getBoundingClientRect();
        setBounds({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
      }
    };
    update();
    const onResize = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(update); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    const interval = setInterval(update, 500);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      clearInterval(interval);
      cancelAnimationFrame(rafRef.current);
    };
  }, [targetSelector]);

  if (!bounds) return null;

  const pad = 8;
  const cutoutStyle = {
    position: 'fixed',
    left: bounds.x - pad,
    top: bounds.y - pad,
    width: bounds.w + pad * 2,
    height: bounds.h + pad * 2,
    borderRadius: 12,
    boxShadow: `0 0 0 9999px rgba(0,0,0,0.6), 0 0 0 ${pad}px rgba(232,185,49,0.3)`,
    zIndex: 51,
    pointerEvents: 'none',
  };

  const tooltipBelow = bounds.y < window.innerHeight * 0.4;
  const tooltipX = Math.min(Math.max(bounds.x + bounds.w / 2, 180), window.innerWidth - 180);
  const tooltipY = tooltipBelow ? bounds.y + bounds.h + 16 : bounds.y - 16;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        <div style={cutoutStyle} />
        <motion.div
          initial={{ opacity: 0, y: tooltipBelow ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-auto glass-modal p-5 rounded-2xl max-w-xs w-[280px]"
          style={{
            left: tooltipX,
            top: tooltipY,
            transform: `translate(-50%, ${tooltipBelow ? '0' : '-100%'})`,
            zIndex: 52,
          }}
        >
          {/* Caret */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              [tooltipBelow ? 'top' : 'bottom']: -6,
              background: 'linear-gradient(135deg, rgba(20,20,26,0.98), rgba(15,15,20,0.99))',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-casino-accent">{step + 1}/{total}</span>
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: i <= step ? 'var(--color-casino-accent)' : 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>
          </div>
          <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
          <p className="text-xs text-casino-text-secondary mb-4">{description}</p>
          <button onClick={onSkip} className="text-[10px] text-casino-text-tertiary hover:text-casino-text-secondary transition-colors">
            Skip tutorial
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
