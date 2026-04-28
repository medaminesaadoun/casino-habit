import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Check, ListTodo, Gem, Dices, Gift } from 'lucide-react';

const STEP1 = (
  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="6" width="144" height="42" rx="8" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.35" />
    <rect x="20" y="16" width="8" height="8" rx="2" fill="#e8b931" fillOpacity="0.25" />
    <line x1="36" y1="20" x2="110" y2="20" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
    <text x="36" y="38" fill="#e8b931" fillOpacity="0.25" fontSize="9" fontFamily="DM Sans, sans-serif">Every day</text>
    <rect x="120" y="16" width="24" height="22" rx="6" fill="#e8b931" fillOpacity="0.25" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.4" />
    <path d="M127 28 L130 31 L137 24" stroke="#e8b931" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M160 36 L174 56 L188 36" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.5" />
    <rect x="162" y="60" width="24" height="22" rx="4" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
    <rect x="162" y="60" width="24" height="12" rx="3" fill="#ef4444" fillOpacity="0.15" />
    <text x="174" y="76" textAnchor="middle" fill="#ef4444" fillOpacity="0.4" fontSize="5" fontWeight="700">CLIP</text>
    <rect x="174" y="62" width="20" height="20" rx="4" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5" />
    <rect x="174" y="62" width="20" height="10" rx="3" fill="#3b82f6" fillOpacity="0.15" />
    <text x="184" y="76" textAnchor="middle" fill="#3b82f6" fillOpacity="0.4" fontSize="5" fontWeight="700">CLIP</text>
    <rect x="190" y="64" width="16" height="16" rx="3" fill="#eab308" fillOpacity="0.35" stroke="#eab308" strokeWidth="1" strokeOpacity="0.5" />
    <rect x="198" y="66" width="20" height="14" rx="3" fill="#e8b931" fillOpacity="0.45" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.6" />
    <text x="208" y="77" textAnchor="middle" fill="#e8b931" fillOpacity="0.6" fontSize="5" fontWeight="800">GOLD</text>
    <rect x="20" y="100" width="224" height="60" rx="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <text x="132" y="118" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Rarity</text>
    <circle cx="48" cy="138" r="6" fill="#ef4444" fillOpacity="0.5" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.6" />
    <text x="48" y="154" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">20%</text>
    <circle cx="92" cy="138" r="5" fill="#3b82f6" fillOpacity="0.5" stroke="#3b82f6" strokeWidth="1" />
    <text x="92" y="154" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">20%</text>
    <circle cx="132" cy="138" r="4.5" fill="#a855f7" fillOpacity="0.5" stroke="#a855f7" strokeWidth="1" />
    <text x="132" y="154" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">15%</text>
    <circle cx="170" cy="138" r="3.5" fill="#f97316" fillOpacity="0.5" stroke="#f97316" strokeWidth="1" />
    <text x="170" y="154" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">4.9%</text>
    <circle cx="210" cy="138" r="2.5" fill="#e8b931" fillOpacity="0.6" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.7" />
    <text x="210" y="154" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">0.1%</text>
  </svg>
);

const STEP2 = (
  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="14" width="80" height="52" rx="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <rect x="20" y="40" width="20" height="18" rx="3" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
    <text x="48" y="52" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="700">2+</text>
    <path d="M96 44 L118 44" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.6" markerEnd="url(#arrowGold)" />
    <defs>
      <marker id="arrowGold" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#e8b931" fillOpacity="0.6" />
      </marker>
    </defs>
    <rect x="122" y="48" width="22" height="22" rx="6" fill="#e8b931" fillOpacity="0.15" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.5" />
    <text x="133" y="63" textAnchor="middle" fill="#e8b931" fillOpacity="0.7" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="700">T1</text>
    <path d="M144 59 L150 59" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.4" />
    <rect x="154" y="48" width="22" height="22" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5" />
    <text x="165" y="63" textAnchor="middle" fill="#3b82f6" fillOpacity="0.7" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="700">T2</text>
    <path d="M176 59 L182 59" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.4" />
    <rect x="186" y="48" width="22" height="22" rx="6" fill="#a855f7" fillOpacity="0.15" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.5" />
    <text x="197" y="63" textAnchor="middle" fill="#a855f7" fillOpacity="0.7" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="700">T3</text>
    <rect x="10" y="90" width="240" height="22" rx="6" fill="#e8b931" fillOpacity="0.06" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.2" />
    <rect x="20" y="100" width="8" height="8" rx="2" fill="#e8b931" fillOpacity="0.35" />
    <text x="34" y="108" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Gold clip = instant Tier 3</text>
    <text x="130" y="142" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="DM Sans, sans-serif">Higher tier → better wheel odds</text>
    <text x="130" y="158" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="DM Sans, sans-serif">Tier resets after every spin</text>
  </svg>
);

const STEP3 = (
  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="58" cy="50" r="36" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.3" />
    <circle cx="58" cy="50" r="30" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.2" />
    <path d="M58 14 L58 28" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
    <text x="58" y="56" textAnchor="middle" fill="#22c55e" fillOpacity="0.5" fontSize="8" fontWeight="700">60%</text>
    <text x="58" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="DM Sans, sans-serif">Token</text>
    <path d="M98 50 L122 50" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="140" cy="50" r="6" fill="#e8b931" fillOpacity="0.3" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.5" />
    <text x="140" y="70" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="DM Sans, sans-serif">+1 token</text>
    <circle cx="126" cy="108" r="48" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.35" />
    <circle cx="126" cy="108" r="40" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.25" />
    <circle cx="126" cy="108" r="18" fill="#e8b931" fillOpacity="0.08" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.4" />
    <path d="M126 60 L134 70 Q126 64 118 70 Z" fill="#e8b931" fillOpacity="0.4" />
    <rect x="88" y="100" width="28" height="16" rx="4" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" />
    <text x="102" y="111" textAnchor="middle" fill="#ef4444" fillOpacity="0.5" fontSize="6" fontWeight="700">T1</text>
    <rect x="118" y="96" width="28" height="16" rx="4" fill="#e8b931" fillOpacity="0.2" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.5" />
    <text x="132" y="107" textAnchor="middle" fill="#e8b931" fillOpacity="0.55" fontSize="6" fontWeight="700">JACKPOT</text>
    <text x="126" y="174" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="DM Sans, sans-serif">Normal 1 token · Mega 5 tokens</text>
    <line x1="190" y1="88" x2="232" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <text x="240" y="92" fill="#e8b931" fillOpacity="0.35" fontSize="7" fontFamily="DM Sans, sans-serif" fontWeight="700">BONUS</text>
  </svg>
);

const STEP4 = (
  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="144" height="58" rx="8" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <rect x="22" y="22" width="8" height="8" rx="2" fill="#22c55e" fillOpacity="0.4" />
    <text x="36" y="30" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Reward in bank</text>
    <rect x="22" y="42" width="120" height="14" rx="4" fill="#e8b931" fillOpacity="0.1" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.2" />
    <text x="82" y="52" textAnchor="middle" fill="#e8b931" fillOpacity="0.4" fontSize="8" fontFamily="DM Sans, sans-serif" fontWeight="600">Claim</text>
    <path d="M158 44 L182 44" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.35" />
    <rect x="188" y="18" width="62" height="42" rx="8" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <text x="219" y="34" textAnchor="middle" fill="#22c55e" fillOpacity="0.5" fontSize="8" fontWeight="700">GRACE</text>
    <text x="219" y="46" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="DM Sans, sans-serif">5 min</text>
    <text x="219" y="56" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="DM Sans, sans-serif">Skip · Cancel</text>
    <rect x="30" y="90" width="200" height="50" rx="8" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.25" />
    <rect x="44" y="106" width="172" height="6" rx="3" fill="#a855f7" fillOpacity="0.3" />
    <rect x="44" y="106" width="120" height="6" rx="3" fill="#a855f7" fillOpacity="0.5" />
    <text x="130" y="122" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="600">Active — 60 min</text>
    <text x="130" y="136" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="DM Sans, sans-serif">Complete before time expires</text>
    <circle cx="58" cy="164" r="3" fill="#e8b931" fillOpacity="0.3" />
    <text x="68" y="168" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="DM Sans, sans-serif">Claim → grace → active → done</text>
  </svg>
);

const STEPS = [
  {
    title: 'Complete Habits',
    subtitle: 'Finish habits to earn randomly colored clips with different rarities',
    icon: ListTodo,
    color: '#e8b931',
    illustration: STEP1,
  },
  {
    title: 'Cash In & Tiers',
    subtitle: 'Collect matching clips to upgrade your tier for better wheel odds',
    icon: Gem,
    color: '#e8b931',
    illustration: STEP2,
  },
  {
    title: 'Spin the Wheel',
    subtitle: 'Win tokens on the 60% mini-wheel, then spin for rewards',
    icon: Dices,
    color: '#e8b931',
    illustration: STEP3,
  },
  {
    title: 'Claim Rewards',
    subtitle: 'Claim rewards from your bank — they enter an active timer',
    icon: Gift,
    color: '#e8b931',
    illustration: STEP4,
  },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-modal p-8 text-center relative overflow-hidden max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: current.color, opacity: 0.12 }}
        />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === step ? 24 : 8,
                height: 8,
                backgroundColor:
                  idx <= step ? current.color : 'rgba(255,255,255,0.08)',
                opacity: idx <= step ? 0.8 : 0.3,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="rounded-full"
            />
          ))}
        </div>

        {/* Illustration */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            {current.illustration}
          </motion.div>
        </AnimatePresence>

        {/* Title + Subtitle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`title-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${current.color}12` }}
            >
              <Icon size={20} style={{ color: current.color }} />
            </div>
            <h2 className="font-heading text-base font-bold text-white mb-1">
              {current.title}
            </h2>
            <p className="text-xs text-casino-text-secondary mb-6">
              {current.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {!isFirst && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center text-casino-text-secondary hover:text-white transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            className="btn-pill btn-gold flex-1 py-3 text-sm font-bold"
          >
            {isLast ? (
              <>
                <Check size={16} />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors"
        >
          Skip tour
        </button>
      </motion.div>
    </motion.div>
  );
}
