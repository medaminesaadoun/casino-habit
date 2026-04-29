import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="modal-panel relative overflow-hidden max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {danger && (
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: 'var(--color-casino-danger)' }} />
            )}

            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center pt-2">
              {danger && (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
                >
                  <AlertTriangle size={24} style={{ color: 'var(--color-casino-danger)' }} />
                </div>
              )}

              <h3 className="font-heading text-lg text-white mb-2">{title}</h3>
              <p className="text-sm text-casino-text-secondary mb-6">{message}</p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 btn-pill btn-ghost py-2.5 text-sm font-semibold"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 btn-pill py-2.5 text-sm font-bold text-white"
                  style={{
                    background: danger
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, var(--color-casino-accent), #c49a2a)',
                    boxShadow: danger
                      ? '0 2px 12px rgba(239,68,68,0.3)'
                      : '0 2px 12px rgba(232,185,49,0.25)',
                  }}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
