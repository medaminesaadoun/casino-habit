import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2 } from 'lucide-react';

export default function UndoToast({ habitName, secondsLeft, onUndo }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (secondsLeft <= 0) setVisible(false);
  }, [secondsLeft]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 bg-[#1a1a1f]">
            <span className="text-sm text-white font-medium max-w-[180px] truncate">
              <span className="text-casino-success">&#10003;</span> {habitName} completed
            </span>
            <span className="text-xs text-casino-text-tertiary tabular-nums w-8 text-right">
              {secondsLeft}s
            </span>
            <button
              onClick={onUndo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-casino-accent/15 text-casino-accent hover:bg-casino-accent/25 text-xs font-bold transition-colors"
            >
              <Undo2 size={13} />
              Undo
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
