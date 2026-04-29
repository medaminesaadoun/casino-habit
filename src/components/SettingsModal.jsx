import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  HelpCircle,
  Download,
  RotateCcw,
  Settings as SettingsIcon,
  Info,
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  onShowHelp,
  onExportData,
  onResetData,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="modal-panel relative overflow-hidden max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                <SettingsIcon size={20} className="text-casino-accent" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-white">Settings</h3>
                <p className="text-xs text-casino-text-tertiary">Customize your experience</p>
              </div>
            </div>

            {/* Sound */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-casino-text-secondary uppercase tracking-wider mb-2">
                Sound
              </p>
              <button
                onClick={onToggleMute}
                className="w-full glass p-3 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX size={18} className="text-casino-text-tertiary" />
                  ) : (
                    <Volume2 size={18} className="text-casino-accent" />
                  )}
                  <span className="text-sm text-white">
                    {isMuted ? 'Sound muted' : 'Sound on'}
                  </span>
                </div>
                <div
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{ backgroundColor: isMuted ? 'rgba(255,255,255,0.1)' : 'var(--color-casino-accent)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: isMuted ? '2px' : '22px' }}
                  />
                </div>
              </button>
            </div>

            {/* Help */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-casino-text-secondary uppercase tracking-wider mb-2">
                Help
              </p>
              <button
                onClick={onShowHelp}
                className="w-full glass p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <HelpCircle size={18} className="text-casino-accent" />
                <span className="text-sm text-white">How to Play</span>
              </button>
            </div>

            {/* Data */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-casino-text-secondary uppercase tracking-wider mb-2">
                Data
              </p>
              <div className="space-y-2">
                <button
                  onClick={onExportData}
                  className="w-full glass p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <Download size={18} className="text-casino-success" />
                  <span className="text-sm text-white">Export Data</span>
                </button>
                <button
                  onClick={onResetData}
                  className="w-full glass p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <RotateCcw size={18} className="text-casino-danger group-hover:rotate-180 transition-transform" />
                  <span className="text-sm text-casino-danger">Reset All Data</span>
                </button>
              </div>
            </div>

            {/* About */}
            <div>
              <p className="text-xs font-semibold text-casino-text-secondary uppercase tracking-wider mb-2">
                About
              </p>
              <div className="glass p-3 rounded-xl flex items-center gap-3">
                <Info size={18} className="text-casino-text-tertiary" />
                <div>
                  <span className="text-sm text-white block">CasinoHabit</span>
                  <span className="text-[10px] text-casino-text-tertiary">Track · Spin · Win</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
