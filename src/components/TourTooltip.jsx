import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ArrowRightLeft, MousePointerClick } from 'lucide-react';
import { SingleClip } from './ClipInventory';

const CLIP_COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', orange: '#f97316', gold: '#e8b931',
};

const STEPS = [
  {
    selector: 'header-stats',
    title: 'Your Resources',
    desc: 'Spin tokens let you play the wheel. Clips upgrade your tier. Higher tier = better rewards.',
    position: 'bottom',
  },
  {
    selector: 'jars-tab',
    title: 'Your Jars',
    desc: 'Every habit links to a jar. Completing habits drops clips into it. Fill a jar to complete it!',
    position: 'top',
    switchToView: 'jars',
  },
  {
    selector: 'add-habit',
    title: 'Create Habits',
    desc: 'Add habits you want to track. Complete them to earn clips and spin tokens.',
    position: 'bottom',
    waitForClick: true,
    clickHint: 'Click the Add Habit button to continue',
    switchToView: 'habits',
  },
  {
    selector: 'habit-list',
    title: 'Complete & Earn',
    desc: 'Tap the checkmark when you finish a habit. Each completion drops a random colored clip.',
    position: 'top',
    switchToView: 'habits',
  },
  {
    selector: 'wheel-area',
    title: 'Spin for Rewards',
    desc: 'Use tokens to spin the wheel. Land on tiers, bonus, or jackpot to win time-based rewards.',
    position: 'top',
    switchToView: 'wheel',
  },
  {
    selector: 'cash-in-area',
    title: 'Upgrade Your Tier',
    desc: 'Collect 2+ matching clips to cash in. This boosts your wheel tier for better odds.',
    position: 'bottom',
    demo: 'cashin',
    switchToView: 'habits',
  },
  {
    selector: 'reward-bank',
    title: 'Claim & Enjoy',
    desc: 'Won rewards go to your bank. Claim them to start the timer, then complete your habit before it expires.',
    position: 'top',
    switchToView: 'rewards',
  },
];

/* ===== DEMO CASH-IN BUTTON ===== */

function DemoCashIn() {
  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="btn-pill btn-gold w-full mt-2 flex items-center justify-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5">
        <div style={{ width: 14, height: 10 }}>
          <SingleClip color="red" />
        </div>
        <div style={{ width: 14, height: 10, marginLeft: -6 }}>
          <SingleClip color="red" />
        </div>
        <div style={{ width: 14, height: 10, marginLeft: -6 }}>
          <SingleClip color="red" />
        </div>
      </div>
      <ArrowRightLeft size={14} />
      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
        T2
      </span>
    </motion.button>
  );
}

/* ===== SPOTLIGHT OVERLAY ===== */

function SpotlightOverlay({ bounds, waitForClick, onClick }) {
  if (!bounds) return null;
  const pad = 10;
  const x = bounds.x - pad;
  const y = bounds.y - pad;
  const w = bounds.w + pad * 2;
  const h = bounds.h + pad * 2;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Top */}
      <div className="absolute left-0 right-0 pointer-events-auto" style={{ top: 0, height: Math.max(0, y), background: 'rgba(0,0,0,0.55)' }} onClick={onClick} />
      {/* Bottom */}
      <div className="absolute left-0 right-0 pointer-events-auto" style={{ top: y + h, bottom: 0, background: 'rgba(0,0,0,0.55)' }} onClick={onClick} />
      {/* Left */}
      <div className="absolute pointer-events-auto" style={{ top: y, left: 0, width: Math.max(0, x), height: h, background: 'rgba(0,0,0,0.55)' }} onClick={onClick} />
      {/* Right */}
      <div className="absolute pointer-events-auto" style={{ top: y, left: x + w, right: 0, height: h, background: 'rgba(0,0,0,0.55)' }} onClick={onClick} />
      {/* Highlight border */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: x, top: y, width: w, height: h,
          borderRadius: 12,
          boxShadow: '0 0 0 2px rgba(232,185,49,0.5), 0 0 20px rgba(232,185,49,0.15), inset 0 0 20px rgba(232,185,49,0.05)',
          animation: waitForClick ? 'pulse-border 1.5s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  );
}

/* ===== TOOLTIP ===== */

function TourTooltipContent({ step, total, title, description, hasDemo, waitForClick, clickHint, position, onNext, onBack, onSkip, isFirst, isLast }) {
  const tooltipRef = useRef(null);
  const [style, setStyle] = useState({ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });

  useEffect(() => {
    if (!tooltipRef.current || !step.bounds) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const pad = 16;
    const targetCx = step.bounds.x + step.bounds.w / 2;
    const targetCy = step.bounds.y + step.bounds.h / 2;

    let left = targetCx - rect.width / 2;
    let top;
    let transform = 'translate(0, 0)';

    if (position === 'bottom') {
      top = step.bounds.y + step.bounds.h + pad;
    } else {
      top = step.bounds.y - rect.height - pad;
    }

    // Clamp to viewport
    left = Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad));
    if (top < pad) top = step.bounds.y + step.bounds.h + pad;
    if (top + rect.height > window.innerHeight - pad) {
      top = step.bounds.y - rect.height - pad;
    }

    setStyle({ left, top, transform });
  }, [step.bounds, position]);

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, y: position === 'bottom' ? -8 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed z-50 pointer-events-auto glass-modal p-5 rounded-2xl max-w-xs w-[300px]"
      style={style}
    >
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-casino-accent tabular-nums">
            {step.index + 1}/{total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: i <= step.index ? 'var(--color-casino-accent)' : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
        </div>
        <button onClick={onSkip} className="text-casino-text-tertiary hover:text-white transition-colors" aria-label="Skip tour">
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-casino-text-secondary leading-relaxed mb-3">{description}</p>

      {/* Demo element */}
      {hasDemo && <DemoCashIn />}

      {/* Click hint for wait-for-click steps */}
      {waitForClick && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-casino-accent/10 border border-casino-accent/20">
          <MousePointerClick size={14} className="text-casino-accent shrink-0 animate-bounce" />
          <span className="text-xs text-casino-accent font-semibold">{clickHint}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onBack}
          disabled={isFirst}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-casino-text-secondary hover:text-white disabled:opacity-20 transition-colors shrink-0"
          aria-label="Previous step"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={waitForClick}
          className={`btn-pill btn-gold flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1 ${waitForClick ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {isLast ? 'Finish' : <>Next <ChevronRight size={14} /></>}
        </button>
      </div>
    </motion.div>
  );
}

/* ===== MAIN COMPONENT ===== */

export default function TourTooltip({ onComplete, onSkip, onSwitchView }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bounds, setBounds] = useState(null);
  const rafRef = useRef(null);

  const step = STEPS[currentStep];

  // Switch to correct view when step changes
  useEffect(() => {
    if (step.switchToView && onSwitchView) {
      onSwitchView(step.switchToView);
    }
  }, [currentStep, step.switchToView, onSwitchView]);

  const updateBounds = useCallback(() => {
    const els = document.querySelectorAll(`[data-tour="${step.selector}"]`);
    const el = Array.from(els).find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (el) {
      const rect = el.getBoundingClientRect();
      setBounds({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
    } else {
      setBounds(null);
    }
  }, [step.selector]);

  useEffect(() => {
    updateBounds();
    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateBounds);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    const interval = setInterval(updateBounds, 500);

    // Delayed re-check after view switch so DOM has time to render
    let delayedCheck;
    if (step.switchToView) {
      delayedCheck = setTimeout(() => {
        updateBounds();
      }, 500);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearInterval(interval);
      cancelAnimationFrame(rafRef.current);
      if (delayedCheck) clearTimeout(delayedCheck);
    };
  }, [updateBounds, step.switchToView]);

  // Attach click listener to highlighted element when waitForClick is true
  useEffect(() => {
    if (!step.waitForClick || !bounds) return;

    const els = document.querySelectorAll(`[data-tour="${step.selector}"]`);
    const el = Array.from(els).find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!el) return;

    const handleClick = () => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((s) => s + 1);
        setBounds(null);
      } else {
        localStorage.setItem('ch_onboarded', 'complete');
        onComplete();
      }
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [step.waitForClick, step.selector, bounds, currentStep, onComplete]);

  const handleNext = () => {
    if (step.waitForClick) return; // blocked
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setBounds(null);
    } else {
      localStorage.setItem('ch_onboarded', 'complete');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setBounds(null);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('ch_onboarded', 'complete');
    onSkip();
  };

  const handleOverlayClick = () => {
    if (step.waitForClick) return; // clicking outside does nothing on wait-for-click steps
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setBounds(null);
    } else {
      localStorage.setItem('ch_onboarded', 'complete');
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 pointer-events-none"
      >
        <SpotlightOverlay bounds={bounds} waitForClick={step.waitForClick} onClick={handleOverlayClick} />
        <TourTooltipContent
          step={{ index: currentStep, bounds }}
          total={STEPS.length}
          title={step.title}
          description={step.desc}
          hasDemo={step.demo === 'cashin'}
          waitForClick={step.waitForClick}
          clickHint={step.clickHint}
          position={step.position}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={currentStep === 0}
          isLast={currentStep === STEPS.length - 1}
        />
      </motion.div>
    </AnimatePresence>
  );
}
