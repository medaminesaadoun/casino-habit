import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Check, ListTodo, Gem, Dices, Gift, Shield, Zap } from 'lucide-react';

const STEP1 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="156" height="58" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
    <rect x="10" y="10" width="3" height="58" rx="1.5" fill="#ef4444" fillOpacity="0.7" />
    <rect x="24" y="20" width="80" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
    <rect x="24" y="32" width="50" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="24" y="42" width="60" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="120" y="24" width="34" height="28" rx="8" fill="#e8b931" fillOpacity="0.35" stroke="#e8b931" strokeWidth="1.5" />
    <path d="M130 38 L133 42 L147 30" stroke="#e8b931" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M168 85 L196 85" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="4 3" />
    <circle cx="220" cy="85" r="38" fill="rgba(0,0,0,0.4)" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.6" />
    <circle cx="220" cy="85" r="32" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.5" />
    <path d="M220 47 L220 63" stroke="#e8b931" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
    <text x="220" y="93" textAnchor="middle" fill="#22c55e" fillOpacity="0.8" fontSize="11" fontWeight="700">WIN</text>
    <text x="220" y="107" textAnchor="middle" fill="#22c55e" fillOpacity="0.5" fontSize="9" fontWeight="600">60%</text>
    <text x="140" y="170" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="600" fontFamily="DM Sans, sans-serif">Complete habit → spin Token Wheel</text>
  </svg>
);

const STEP2 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="140" y="18" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="700" fontFamily="DM Sans, sans-serif">Every habit drops a clip</text>
    {[
      { c: '#ef4444', l: '20%', x: 22 },
      { c: '#3b82f6', l: '20%', x: 76 },
      { c: '#22c55e', l: '20%', x: 130 },
      { c: '#eab308', l: '20%', x: 184 },
      { c: '#a855f7', l: '15%', x: 238 },
    ].map(({ c, l, x }) => (
      <g key={c}>
        <rect x={x - 2} y="35" width="6" height="12" rx="2" fill="#8b8680" fillOpacity="0.6" />
        <rect x={x + 18} y="35" width="6" height="12" rx="2" fill="#8b8680" fillOpacity="0.6" />
        <rect x={x - 8} y="42" width="42" height="30" rx="5" fill={c} fillOpacity="0.55" stroke={c} strokeWidth="1.5" strokeOpacity="0.7" />
        <text x={x + 13} y="62" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="700">{l}</text>
      </g>
    ))}
    {[
      { c: '#f97316', l: '4.9%', x: 60 },
      { c: '#e8b931', l: '0.1%', x: 180 },
    ].map(({ c, l, x }) => (
      <g key={c}>
        <rect x={x - 2} y="105" width="6" height="12" rx="2" fill="#8b8680" fillOpacity="0.6" />
        <rect x={x + 18} y="105" width="6" height="12" rx="2" fill="#8b8680" fillOpacity="0.6" />
        <rect x={x - 8} y="112" width={c === '#e8b931' ? '46' : '42'} height="30" rx="5" fill={c} fillOpacity="0.6" stroke={c} strokeWidth={c === '#e8b931' ? '2' : '1.5'} strokeOpacity="0.8" />
        <text x={x + 13} y="132" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8" fontWeight="700">{l}</text>
      </g>
    ))}
    <text x="140" y="172" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" fontWeight="500" fontFamily="DM Sans, sans-serif">7 clip colors · collect matching ones to cash in</text>
  </svg>
);

const STEP3 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="24" y="20" width="22" height="32" rx="4" fill="#ef4444" fillOpacity="0.5" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
      <rect x="26" y="22" width="22" height="32" rx="4" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
      <rect x="28" y="24" width="22" height="32" rx="4" fill="#ef4444" fillOpacity="0.55" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" />
    </g>
    <text x="35" y="72" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">2+ matching</text>
    <path d="M70 52 L102 52" stroke="#e8b931" strokeWidth="2.5" strokeOpacity="0.7" strokeLinecap="round" markerEnd="url(#arrGold2)" />
    <defs>
      <marker id="arrGold2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#e8b931" fillOpacity="0.7" />
      </marker>
    </defs>
    <g transform="translate(110, 20)">
      <rect x="0" y="0" width="36" height="24" rx="8" fill="#e8b931" fillOpacity="0.2" stroke="#e8b931" strokeWidth="2.5" strokeOpacity="0.6" />
      <text x="18" y="17" textAnchor="middle" fill="#e8b931" fillOpacity="0.85" fontSize="11" fontWeight="800">T1</text>
      <path d="M40 12 L52 12" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.4" />
      <rect x="56" y="0" width="36" height="24" rx="8" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.6" />
      <text x="74" y="17" textAnchor="middle" fill="#3b82f6" fillOpacity="0.85" fontSize="11" fontWeight="800">T2</text>
      <path d="M96 12 L108 12" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.4" />
      <rect x="112" y="0" width="36" height="24" rx="8" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2.5" strokeOpacity="0.6" />
      <text x="130" y="17" textAnchor="middle" fill="#a855f7" fillOpacity="0.85" fontSize="11" fontWeight="800">T3</text>
    </g>
    <rect x="20" y="120" width="240" height="28" rx="8" fill="#e8b931" fillOpacity="0.08" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.3" />
    <text x="140" y="139" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">Gold clip = instant Tier 3</text>
    <text x="140" y="168" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="500" fontFamily="DM Sans, sans-serif">Tier resets after each spin</text>
  </svg>
);

const STEP4 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[
      { l: 'T1', c: '#ef4444', s: 0, e: 144 },
      { l: 'T2', c: '#3b82f6', s: 144, e: 252 },
      { l: 'T3', c: '#a855f7', s: 252, e: 324 },
      { l: 'BONUS', c: '#eab308', s: 324, e: 352.8 },
      { l: 'JACKPOT', c: '#e8b931', s: 352.8, e: 360 },
    ].map(seg => {
      const mid = (seg.s + seg.e) / 2 * Math.PI / 180;
      const lx = 140 + 44 * Math.cos(mid - Math.PI / 2);
      const ly = 88 + 44 * Math.sin(mid - Math.PI / 2);
      return (
        <g key={seg.l}>
          <path d={`M${140 + 62 * Math.cos((seg.e - 90) * Math.PI / 180)},${88 + 62 * Math.sin((seg.e - 90) * Math.PI / 180)} A62,62 0 ${seg.e - seg.s <= 180 ? '0' : '1'},0 ${140 + 62 * Math.cos((seg.s - 90) * Math.PI / 180)},${88 + 62 * Math.sin((seg.s - 90) * Math.PI / 180)} L${140 + 22 * Math.cos((seg.s - 90) * Math.PI / 180)},${88 + 22 * Math.sin((seg.s - 90) * Math.PI / 180)} A22,22 0 ${seg.e - seg.s <= 180 ? '0' : '1'},1 ${140 + 22 * Math.cos((seg.e - 90) * Math.PI / 180)},${88 + 22 * Math.sin((seg.e - 90) * Math.PI / 180)} Z`}
            fill={seg.c} fillOpacity="0.6" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="white" fillOpacity="0.85" fontSize="6" fontWeight="700">{seg.l}</text>
        </g>
      );
    })}
    <circle cx="140" cy="88" r="62" fill="none" stroke="#e8b931" strokeWidth="2.5" strokeOpacity="0.5" />
    <circle cx="140" cy="88" r="22" fill="#1a1a1f" fillOpacity="0.6" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.6" />
    <path d="M140 16 L152 34 Q140 28 128 34 Z" fill="#e8b931" fillOpacity="0.7" />
    <rect x="90" y="158" width="100" height="22" rx="6" fill="#e8b931" fillOpacity="0.12" stroke="#e8b931" strokeWidth="1" strokeOpacity="0.4" />
    <text x="140" y="174" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">1 token normal · 5 tokens Mega</text>
  </svg>
);

const STEP5 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="120" height="56" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
    <text x="68" y="34" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">Reward Bank</text>
    <rect x="28" y="44" width="80" height="16" rx="6" fill="#e8b931" fillOpacity="0.2" stroke="#e8b931" strokeWidth="1.5" strokeOpacity="0.5" />
    <text x="68" y="56" textAnchor="middle" fill="#e8b931" fillOpacity="0.7" fontSize="9" fontWeight="700">Claim</text>
    <path d="M132 44 L156 44" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 2" />
    <rect x="160" y="16" width="60" height="36" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" />
    <text x="190" y="32" textAnchor="middle" fill="#22c55e" fillOpacity="0.8" fontSize="9" fontWeight="700">GRACE</text>
    <text x="190" y="46" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">skip / cancel</text>
    <rect x="30" y="88" width="220" height="54" rx="10" fill="rgba(255,255,255,0.03)" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.3" />
    <text x="140" y="108" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">Active Reward</text>
    <rect x="44" y="118" width="192" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
    <rect x="44" y="118" width="130" height="6" rx="3" fill="#a855f7" fillOpacity="0.5" />
    <text x="140" y="136" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="DM Sans, sans-serif">Complete before timer expires</text>
    <circle cx="140" cy="170" r="4" fill="#e8b931" fillOpacity="0.4" />
    <text x="152" y="173" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans, sans-serif">Claim → grace → active → done</text>
  </svg>
);

const STEP6 = (
  <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="140" cy="58" r="38" fill="rgba(255,255,255,0.02)" stroke="#e8b931" strokeWidth="2" strokeOpacity="0.4" />
    <path d="M132 58 L138 66 L150 48" stroke="#e8b931" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
    <text x="140" y="115" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="600" fontFamily="DM Sans, sans-serif">Complete your habit before the reward</text>
    <rect x="24" y="128" width="232" height="2" rx="1" fill="rgba(255,255,255,0.05)" />
    <circle cx="80" cy="155" r="5" fill="#e8b931" fillOpacity="0.3" />
    <text x="95" y="159" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans, sans-serif">Timer starts when you begin</text>
    <circle cx="80" cy="175" r="5" fill="#e8b931" fillOpacity="0.3" />
    <text x="95" y="179" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="DM Sans, sans-serif">Honor system — the app trusts you</text>
  </svg>
);

const STEPS = [
  {
    title: 'Complete Habits',
    subtitle: 'Each habit triggers the Token Wheel',
    icon: ListTodo,
    color: '#ef4444',
    illustration: STEP1,
    bullets: ['Complete any habit', 'Token Wheel appears (60% WIN)', 'Win = +1 spin token', 'Miss = try again on next habit'],
  },
  {
    title: 'Earn Clips',
    subtitle: 'Every habit drops a random colored clip',
    icon: Gem,
    color: '#3b82f6',
    illustration: STEP2,
    bullets: ['Each completion drops a random clip', '7 colors · different rarities', 'Gold clip = ultra rare (0.1%)', 'Collect matching clips to cash in'],
  },
  {
    title: 'Cash In for Tiers',
    subtitle: 'Matching clips unlock better wheel odds',
    icon: Dices,
    color: '#a855f7',
    illustration: STEP3,
    bullets: ['2+ matching clips → cash in', 'Upgrade tier: T1 → T2 → T3', 'Gold clip = instant Tier 3', 'Higher tier = better wheel rewards', 'Tier resets after each spin'],
  },
  {
    title: 'Spin the Wheel',
    subtitle: 'Tokens let you spin for prizes',
    icon: Dices,
    color: '#e8b931',
    illustration: STEP4,
    bullets: ['Normal spin = 1 token', 'Mega spin = 5 tokens (boosted odds)', 'Mega spin ignores tier — land = win', 'Use Quick Lock to log without a habit', 'Bonus wheel on Bonus land', 'Near-miss keeps it exciting'],
  },
  {
    title: 'Claim & Enjoy',
    subtitle: 'Claim rewards before they expire',
    icon: Gift,
    color: '#22c55e',
    illustration: STEP5,
    bullets: ['Win → reward goes to your bank', 'Claim → grace period starts', 'Skip grace → active timer begins', 'Complete before it expires', 'Dismiss expired rewards anytime'],
  },
  {
    title: 'Play Fair',
    subtitle: 'Earn rewards by completing habits first',
    icon: Shield,
    color: '#e8b931',
    illustration: STEP6,
    bullets: ['Complete your habit before the reward', 'Timer starts when you begin the reward', 'No shortcuts — the app trusts you', 'Rewards only count after the timer starts'],
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
        className="modal-panel p-8 text-center relative overflow-hidden max-w-lg w-full"
        style={{ background: 'linear-gradient(135deg, rgba(20,20,26,0.98) 0%, rgba(15,15,20,0.99) 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: current.color, opacity: 0.15 }}
        />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-casino-text-tertiary hover:text-white hover:bg-white/5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === step ? 28 : 8,
                height: 8,
                backgroundColor: idx <= step ? current.color : 'rgba(255,255,255,0.1)',
                opacity: idx <= step ? 1 : 0.35,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="rounded-full"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3"
          >
            {current.illustration}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`title-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${current.color}18` }}>
              <Icon size={20} style={{ color: current.color }} />
            </div>
            <h2 className="font-heading text-lg font-bold text-white mb-1">
              {current.title}
            </h2>
            <p className="text-sm text-casino-text-secondary mb-4">
              {current.subtitle}
            </p>
            <div className="text-left space-y-1.5 pb-2">
              {current.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: `${current.color}80` }} />
                  <span className="text-[11px] text-casino-text-secondary leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-1">
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
            {isLast ? <><Check size={16} /> Get Started</> : <><ChevronRight size={16} /> Next</>}
          </button>
        </div>

        <button onClick={onClose} className="mt-4 text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors">
          Skip tour
        </button>
      </motion.div>
    </motion.div>
  );
}
