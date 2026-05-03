import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Check, Play, Sparkles } from 'lucide-react';
import { SingleClip } from './ClipInventory';

/* ===== STEP 1: Habit → Clip → Jar ===== */

function Step1HabitToJar() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),   // show check
      setTimeout(() => setPhase(2), 1400),  // show clip
      setTimeout(() => setPhase(3), 2400),  // clip drops
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64 relative">
      {/* Habit card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass shape-card p-4 w-56 relative"
        style={{ borderLeft: '3px solid #ef4444' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef444480' }} />
          <span className="text-sm font-semibold text-white">Morning Workout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            animate={phase >= 1 ? { scale: [1, 0.9, 1], backgroundColor: '#22c55e' } : {}}
            transition={{ duration: 0.3 }}
            className="btn-pill w-full py-2 text-xs font-bold text-white"
            style={{ background: phase >= 1 ? '#22c55e' : 'linear-gradient(135deg, #ef4444, #ef4444cc)' }}
          >
            {phase >= 1 ? <><Check size={14} className="inline mr-1" />Done!</> : 'Complete Habit'}
          </motion.button>
        </div>
      </motion.div>

      {/* Arrow */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="my-3 text-casino-accent"
          >
            <ChevronRight size={20} className="rotate-90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clip dropping */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.5 }}
            animate={phase >= 3 ? { y: 60, opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: phase >= 3 ? 0 : 0 }}
            className="absolute"
            style={{ top: phase >= 3 ? 'auto' : '140px', bottom: phase >= 3 ? '20px' : 'auto' }}
          >
            <SingleClip color="blue" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jar (appears when clip drops) */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="jar-visual"
            style={{ marginTop: '20px' }}
          >
            <div className="jar-lid" />
            <div className="jar-neck" />
            <div className="jar-body">
              <div className="jar-count">1</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== STEP 2: Clips → Tier Upgrade ===== */

function Step2TierUpgrade() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // clips gather
      setTimeout(() => setPhase(2), 1500),  // glow
      setTimeout(() => setPhase(3), 2200),  // transform to tier
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64 relative">
      {/* 2 Clips */}
      <div className="flex items-end gap-1 mb-6">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, x: (i - 0.5) * 60 }}
            animate={phase >= 1 ? { opacity: 1, y: 0, x: 0 } : {}}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 300 }}
          >
            <motion.div
              animate={phase >= 2 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: phase >= 2 ? Infinity : 0, duration: 0.6 }}
            >
              <SingleClip color="red" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : {}}
        className="text-casino-accent mb-6"
      >
        <ChevronRight size={24} className="rotate-90" />
      </motion.div>

      {/* Tier Badge */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="px-6 py-3 rounded-2xl font-bold text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 20px rgba(239,68,68,0.4), 0 0 0 1px rgba(239,68,68,0.3)',
            }}
          >
            Tier 2
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="mt-4 text-sm text-casino-text-secondary"
      >
        Collect matching clips to upgrade your spin tier
      </motion.p>
    </div>
  );
}

/* ===== STEP 3: Spin & Win ===== */

function Step3SpinWin() {
  const [spinning, setSpinning] = useState(true);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSpinning(false), 2500);
    const t2 = setTimeout(() => setLanded(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      {/* Mini wheel */}
      <div className="relative mb-4" style={{ width: 140, height: 140 }}>
        <motion.svg
          width="140" height="140" viewBox="0 0 140 140"
          animate={{ rotate: spinning ? 360 * 5 + 288 : 360 * 5 + 288 }}
          transition={{ duration: spinning ? 2.5 : 0, ease: spinning ? [0.15, 0.85, 0.35, 1] : 'linear' }}
          style={{ transformOrigin: '70px 70px' }}
        >
          {/* Simplified 5-segment wheel */}
          <path d="M70,70 L70,10 A60,60 0 0,1 127.43,42.43 Z" fill="#ef4444" opacity="0.7" />
          <path d="M70,70 L127.43,42.43 A60,60 0 0,1 127.43,97.57 Z" fill="#3b82f6" opacity="0.7" />
          <path d="M70,70 L127.43,97.57 A60,60 0 0,1 70,130 Z" fill="#a855f7" opacity="0.7" />
          <path d="M70,70 L70,130 A60,60 0 0,1 12.57,97.57 Z" fill="#eab308" opacity="0.7" />
          <path d="M70,70 L12.57,97.57 A60,60 0 0,1 12.57,42.43 Z" fill="#e8b931" opacity="0.7" />
          <path d="M70,70 L12.57,42.43 A60,60 0 0,1 70,10 Z" fill="#22c55e" opacity="0.7" />
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        </motion.svg>
        {/* Pointer */}
        <svg className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" width="16" height="18" viewBox="0 0 16 18">
          <path d="M8 16 L14 4 Q8 0 2 4 Z" fill="#e8b931" />
        </svg>
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center z-10">
          <Sparkles size={16} className="text-casino-accent" />
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {landed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass shape-card p-3 text-center"
            style={{ borderTop: '3px solid #eab308', boxShadow: '0 0 24px #eab30830' }}
          >
            <p className="text-sm font-bold text-white">Bonus Wheel!</p>
            <p className="text-xs text-casino-text-secondary">Extra spin with boosted odds</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== STEP 4: Ready ===== */

function Step4Ready({ onStartTour, onSkip }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, var(--color-casino-accent), #c49a2a)' }}
      >
        <Play size={28} className="text-white ml-1" />
      </motion.div>
      <h3 className="font-heading text-xl text-white mb-2">You're Ready!</h3>
      <p className="text-sm text-casino-text-secondary mb-6 max-w-xs">
        Add your first habit to start earning clips and spinning for rewards.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onStartTour}
          className="btn-pill btn-gold px-6 py-2.5 text-sm font-bold"
        >
          Start Tour
        </button>
        <button
          onClick={onSkip}
          className="btn-pill btn-ghost px-6 py-2.5 text-sm font-semibold"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */

const STEPS = [
  { title: 'Complete Habits', subtitle: 'Finish a habit to earn a random colored clip' },
  { title: 'Collect & Upgrade', subtitle: '2 matching clips → Tier 2, 3 clips → Tier 3, gold clip → instant Tier 3' },
  { title: 'Spin & Win', subtitle: 'Use tokens to spin for time-based rewards' },
  { title: 'Get Started', subtitle: 'Your first habit is waiting' },
];

export default function OnboardingModal({ onStartTour, onSkip }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleSkip = () => {
    localStorage.setItem('ch_onboarded', 'skipped');
    onSkip();
  };

  const handleStartTour = () => {
    localStorage.setItem('ch_onboarded', 'tour');
    onStartTour();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="modal-panel relative overflow-hidden max-w-md w-full mx-4"
        style={{ background: 'linear-gradient(135deg, rgba(20,20,26,0.98) 0%, rgba(15,15,20,0.99) 100%)' }}
      >
        {/* Close button (skip everything) */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
          aria-label="Skip onboarding"
        >
          <X size={18} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6 pt-2">
          {STEPS.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === step ? 28 : 8,
                height: 8,
                backgroundColor: idx <= step ? 'var(--color-casino-accent)' : 'rgba(255,255,255,0.1)',
                opacity: idx <= step ? 1 : 0.35,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="rounded-full"
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Title */}
              <div className="text-center mb-2">
                <h2 className="font-heading text-lg font-bold text-white">
                  {STEPS[step].title}
                </h2>
                <p className="text-sm text-casino-text-secondary mt-1">
                  {STEPS[step].subtitle}
                </p>
              </div>

              {/* Animation area */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-5 overflow-hidden">
                {step === 0 && <Step1HabitToJar />}
                {step === 1 && <Step2TierUpgrade />}
                {step === 2 && <Step3SpinWin />}
                {step === 3 && <Step4Ready onStartTour={handleStartTour} onSkip={handleSkip} />}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation (only for steps 0-2) */}
          {!isLast && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={isFirst}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-casino-text-secondary hover:text-white disabled:opacity-20 transition-colors shrink-0"
                aria-label="Previous step"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-pill btn-gold flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
