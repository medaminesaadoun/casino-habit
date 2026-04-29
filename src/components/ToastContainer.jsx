import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'var(--color-casino-success)',
  error: 'var(--color-casino-danger)',
  warning: 'var(--color-casino-warning)',
  info: 'var(--color-casino-accent)',
};

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const Icon = ICONS[toast.type] || Info;
  const color = COLORS[toast.type] || COLORS.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 min-w-[240px] max-w-[320px]"
      style={{ backgroundColor: 'rgba(19,19,24,0.95)' }}
    >
      <Icon size={18} style={{ color }} />
      <span className="text-sm text-white font-medium flex-1">{toast.message}</span>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (toast.duration || 3000) / 1000, ease: 'linear' }}
          style={{ backgroundColor: color, height: '100%' }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  const visible = toasts.slice(-3);

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
