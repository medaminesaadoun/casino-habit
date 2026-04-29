import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CX = { token: 60, main: 75 };
const CY = { token: 60, main: 75 };
const OUTER = { token: 55, main: 70 };
const INNER = { token: 20, main: 28 };

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutPath(cx, cy, ir, or, sa, ea) {
  const os = polarToCartesian(cx, cy, or, ea);
  const oe = polarToCartesian(cx, cy, or, sa);
  const is = polarToCartesian(cx, cy, ir, ea);
  const ie = polarToCartesian(cx, cy, ir, sa);
  const la = ea - sa <= 180 ? '0' : '1';
  return `M${os.x},${os.y} A${or},${or} 0 ${la} 0 ${oe.x},${oe.y} L${ie.x},${ie.y} A${ir},${ir} 0 ${la} 1 ${is.x},${is.y} Z`;
}

function Scene1() {
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 2000); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="glass p-4 rounded-2xl w-64" style={{ borderLeft: '3px solid #ef4444' }}>
        <p className="text-sm font-semibold text-white mb-1">☕ Morning Coffee</p>
        <p className="text-[10px] text-casino-text-tertiary">Jar: Fitness · Streak: 3</p>
        <motion.button
          whileTap={{ scale: 0.93 }}
          className="btn-pill w-full py-2 mt-3 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ef4444, #ef4444cc)', boxShadow: '0 2px 12px #ef444440' }}
          animate={done ? { opacity: 0.5 } : { opacity: 1 }}
        >
          {done ? '✓ Done!' : 'Complete Habit'}
        </motion.button>
      </div>
      {done && (
        <motion.div
          initial={{ y: -60, opacity: 0, rotate: -20 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="flex items-center gap-3 glass p-3 rounded-2xl"
        >
          <svg width="36" height="36" viewBox="0 0 44 40">
            <rect x="2" y="4" width="6" height="12" rx="2" fill="#8b8680" opacity="0.6" />
            <rect x="20" y="4" width="6" height="12" rx="2" fill="#8b8680" opacity="0.6" />
            <rect x="-4" y="11" width="42" height="24" rx="5" fill="#f97316" opacity="0.7" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.7" />
            <text x="17" y="28" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">15%</text>
          </svg>
          <span className="text-sm font-semibold text-white">Orange clip earned!</span>
        </motion.div>
      )}
    </div>
  );
}

function Scene2() {
  const [spinning, setSpinning] = useState(true);
  useEffect(() => { const t = setTimeout(() => setSpinning(false), 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <motion.svg
          width="120" height="120" viewBox="0 0 120 120"
          animate={{ rotate: spinning ? 360 * 4 + 108 : 360 * 4 + 108 }}
          transition={{ duration: spinning ? 3 : 0, ease: spinning ? [0.15, 0.85, 0.35, 1] : 'linear' }}
          style={{ transformOrigin: '60px 60px' }}
        >
          <path d={donutPath(CX.token, CY.token, INNER.token, OUTER.token, 0, 216)} fill="#22c55e" opacity="0.7" />
          <path d={donutPath(CX.token, CY.token, INNER.token, OUTER.token, 216, 360)} fill="#374151" opacity="0.5" />
          <circle cx="60" cy="60" r={OUTER.token} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
          <text x="60" y="58" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">WIN</text>
          <text x="60" y="70" textAnchor="middle" fill="white" fontSize="8" opacity="0.6">60%</text>
        </motion.svg>
        <svg className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" width="16" height="18" viewBox="0 0 16 18">
          <path d="M8 16 L14 4 Q8 0 2 4 Z" fill="#e8b931" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center z-10">
          <span className="text-lg">⚡</span>
        </div>
      </div>
      {!spinning && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.4 }} className="text-2xl font-bold liquid-gold">
          +1 Token
        </motion.div>
      )}
    </div>
  );
}

function Scene3() {
  const [spinning, setSpinning] = useState(true);
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setSpinning(false); setConfetti(true); }, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <motion.svg
          width="150" height="150" viewBox="0 0 150 150"
          animate={{ rotate: spinning ? 360 * 4 + 288 : 360 * 4 + 288 }}
          transition={{ duration: spinning ? 3 : 0, ease: spinning ? [0.15, 0.85, 0.35, 1] : 'linear' }}
          style={{ transformOrigin: '75px 75px' }}
        >
          {[
            { c: '#ef4444', s: 0, e: 144 },
            { c: '#3b82f6', s: 144, e: 252 },
            { c: '#a855f7', s: 252, e: 324 },
            { c: '#eab308', s: 324, e: 352.8 },
            { c: '#e8b931', s: 352.8, e: 360 },
          ].map((seg) => (
            <path key={seg.c} d={donutPath(CX.main, CY.main, INNER.main, OUTER.main, seg.s, seg.e)} fill={seg.c} opacity="0.7" />
          ))}
          <circle cx="75" cy="75" r={OUTER.main} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        </motion.svg>
        <svg className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" width="16" height="18" viewBox="0 0 16 18">
          <path d="M8 16 L14 4 Q8 0 2 4 Z" fill="#e8b931" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center z-10">
          <span className="text-lg">✨</span>
        </div>
      </div>
      {confetti && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{
                background: i % 3 === 0 ? '#e8b931' : i % 3 === 1 ? '#a855f7' : '#ef4444',
                left: '50%', top: '45%',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200 - 40,
                opacity: [1, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{ delay: i * 0.03, duration: 1.5 }}
            />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-3 rounded-2xl text-center"
            style={{ borderTop: '3px solid #a855f7', boxShadow: '0 0 24px #a855f720' }}
          >
            <p className="text-sm font-bold text-white">Free hour</p>
            <p className="text-xs text-casino-text-secondary">60 min · Tier 3</p>
          </motion.div>
        </>
      )}
    </div>
  );
}

const SCENES = [
  { component: Scene1, caption: 'Complete habits → earn random clips', color: '#ef4444' },
  { component: Scene2, caption: 'Win tokens to spin the Main Wheel', color: '#22c55e' },
  { component: Scene3, caption: 'Land rewards. Claim them. Enjoy.', color: '#a855f7' },
];

export default function DemoWalkthrough({ onComplete, onSkip }) {
  const [scene, setScene] = useState(0);
  const timerRef = useRef(null);
  const SceneComponent = SCENES[scene].component;
  const sceneData = SCENES[scene];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (scene < SCENES.length - 1) setScene((s) => s + 1);
      else onComplete();
    }, 15000);
    return () => clearTimeout(timerRef.current);
  }, [scene, onComplete]);

  const goTo = (idx) => {
    clearTimeout(timerRef.current);
    setScene(idx);
  };
  const handleSkip = () => { clearTimeout(timerRef.current); onSkip(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex flex-col items-center max-w-md w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="glass-modal p-6 rounded-2xl w-full text-center mb-6 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundColor: sceneData.color }}
            />
            <SceneComponent />
            <p className="mt-4 text-xs text-casino-text-secondary">{sceneData.caption}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={() => goTo(scene - 1)}
            disabled={scene === 0}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-casino-text-secondary hover:text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {SCENES.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === scene ? 24 : 8, height: 8, backgroundColor: i === scene ? sceneData.color : 'rgba(255,255,255,0.15)' }}
                className="rounded-full"
              />
            ))}
          </div>
          <button
            onClick={() => goTo(scene + 1)}
            disabled={scene === SCENES.length - 1}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-casino-text-secondary hover:text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {scene === SCENES.length - 1 ? (
          <button onClick={onComplete} className="btn-pill btn-gold mt-5 px-8 py-3 text-sm font-bold">
            Let's Go!
          </button>
        ) : (
          <button onClick={handleSkip} className="mt-5 text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors">
            Skip Tutorial
          </button>
        )}
      </div>
    </motion.div>
  );
}
