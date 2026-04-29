import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Sparkles, XCircle, Trophy } from 'lucide-react';
import { playSpinStart, playTickIfPassed, resetTickTracking, playTokenWin, playTokenMiss } from '../sounds';

const CLIP_COLORS = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', purple: '#a855f7', orange: '#f97316', gold: '#e8b931' };

// WIN = 60% = 216°, MISS = 40% = 144°
const TOKEN_SEGMENTS = [
  { label: 'WIN',  color: '#22c55e', start: 0,   end: 216 },
  { label: 'MISS', color: '#374151', start: 216, end: 360 },
];

const WIN_END = 216;
const CX = 100;
const CY = 100;
const OUTER_R = 90;
const INNER_R = 44;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutSegment(cx, cy, innerR, outerR, startAngle, endAngle) {
  const os = polarToCartesian(cx, cy, outerR, endAngle);
  const oe = polarToCartesian(cx, cy, outerR, startAngle);
  const is = polarToCartesian(cx, cy, innerR, endAngle);
  const ie = polarToCartesian(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', os.x, os.y, 'A', outerR, outerR, 0, large, 0, oe.x, oe.y, 'L', ie.x, ie.y, 'A', innerR, innerR, 0, large, 1, is.x, is.y, 'Z'].join(' ');
}

function getTextRotation(midAngle) {
  const a = ((midAngle % 360) + 360) % 360;
  if (a > 90 && a <= 270) return a - 180;
  return a;
}

export default function TokenWheel({ onComplete, clipColor }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [ringRotation, setRingRotation] = useState(0);
  const [glowColor, setGlowColor] = useState('#22c55e');
  const controls = useAnimation();

  useEffect(() => {
    if (clipColor && CLIP_COLORS[clipColor]) {
      setGlowColor(CLIP_COLORS[clipColor]);
      const t = setTimeout(() => setGlowColor('#22c55e'), 2000);
      return () => clearTimeout(t);
    }
  }, [clipColor]);

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    playSpinStart();
    resetTickTracking();

    const actualResult = Math.random() < 0.6 ? 'WIN' : 'MISS';
    const baseSpins = 5 + Math.floor(Math.random() * 3);
    let finalAngle;
    if (actualResult === 'WIN') {
      finalAngle = 30 + Math.random() * 150;
    } else {
      const doNearMiss = Math.random() < 0.7;
      if (doNearMiss) finalAngle = 218 + Math.random() * 12;
      else finalAngle = 250 + Math.random() * 80;
    }

    setRingRotation((prev) => prev + 6 * 360);
    const targetRotation = baseSpins * 360 + (360 - finalAngle);
    await controls.start({ rotate: targetRotation, transition: { duration: 3, ease: [0.15, 0.85, 0.35, 1] } });

    setResult(actualResult);
    setShowResult(true);
    setIsSpinning(false);
    if (actualResult === 'WIN') playTokenWin();
    else playTokenMiss();

    setTimeout(() => { onComplete(actualResult === 'WIN'); }, 1800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel flex flex-col items-center" style={{ borderColor: `${glowColor}40`, boxShadow: `0 0 30px ${glowColor}15, 0 24px 64px rgba(0,0,0,0.5)` }}>
        <h2 className="text-lg font-bold text-white mb-1">Token Spin</h2>
        <p className="text-xs text-casino-text-tertiary mb-6">60% chance to win a spin token</p>

        <div className="relative mb-6">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: isSpinning
                ? '0 0 50px rgba(34,197,94,0.25), 0 0 100px rgba(34,197,94,0.12)'
                : '0 0 30px rgba(34,197,94,0.15), 0 0 60px rgba(34,197,94,0.07)',
              transition: 'box-shadow 0.5s ease',
            }}
          />

          {/* Pointer */}
          <svg className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" width="24" height="30" viewBox="0 0 24 30">
            <defs>
              <filter id="tknPtrShadow" x="-30%" y="-10%" width="160%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.7)" />
              </filter>
            </defs>
            <path d="M12 28 L22 7 Q12 2 2 7 Z" fill="var(--color-casino-accent)" filter="url(#tknPtrShadow)" />
            <path d="M12 23 L19 9 Q12 5 5 9 Z" fill="rgba(255,255,255,0.35)" />
            <circle cx="12" cy="28" r="3.5" fill="var(--color-casino-accent)" filter="url(#tknPtrShadow)" />
            <circle cx="12" cy="28" r="2" fill="rgba(255,255,255,0.65)" />
          </svg>

          {/* SVG Wheel */}
          <div className="relative" style={{ width: 200, height: 200 }}>
            <motion.svg
              width="200" height="200" viewBox="0 0 200 200"
              animate={controls}
              onUpdate={(latest) => { if (typeof latest.rotate === 'number') playTickIfPassed(latest.rotate); }}
              style={{ transformOrigin: '100px 100px' }}
            >
              <defs>
                {/* WIN segment gradient — inner bright, outer fades */}
                <linearGradient id="winGrad" gradientUnits="userSpaceOnUse"
                  x1={CX} y1={CY}
                  x2={polarToCartesian(CX, CY, OUTER_R, WIN_END / 2).x}
                  y2={polarToCartesian(CX, CY, OUTER_R, WIN_END / 2).y}
                >
                  <stop offset="0%"   stopColor="#4ade80" />
                  <stop offset="50%"  stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                {/* MISS segment gradient */}
                <linearGradient id="missGrad" gradientUnits="userSpaceOnUse"
                  x1={CX} y1={CY}
                  x2={polarToCartesian(CX, CY, OUTER_R, 288).x}
                  y2={polarToCartesian(CX, CY, OUTER_R, 288).y}
                >
                  <stop offset="0%"   stopColor="#4b5563" />
                  <stop offset="50%"  stopColor="#374151" />
                  <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>
                <radialGradient id="tknDepth" cx="50%" cy="35%" r="65%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                  <stop offset="55%"  stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
                </radialGradient>
                <radialGradient id="tknVignette" cx="50%" cy="50%" r="50%">
                  <stop offset="75%"  stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
                </radialGradient>
              </defs>

              {/* WIN segment */}
              <path
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, 0, WIN_END)}
                fill="url(#winGrad)"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="1"
              />
              {/* MISS segment */}
              <path
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, WIN_END, 360)}
                fill="url(#missGrad)"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="1"
              />

              {/* Divider spokes */}
              {TOKEN_SEGMENTS.map((seg) => {
                const p1 = polarToCartesian(CX, CY, INNER_R + 2, seg.start);
                const p2 = polarToCartesian(CX, CY, OUTER_R - 2, seg.start);
                return (
                  <line key={seg.label} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                );
              })}

              {/* Rim rings */}
              <circle cx={CX} cy={CY} r={OUTER_R - 1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
              <circle cx={CX} cy={CY} r={INNER_R + 1} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

              {/* Boundary ticks */}
              {TOKEN_SEGMENTS.map((seg) => {
                const p = polarToCartesian(CX, CY, OUTER_R - 5, seg.start);
                return <circle key={`t-${seg.label}`} cx={p.x} cy={p.y} r={2.5} fill="rgba(255,255,255,0.5)" />;
              })}

              {/* Depth + vignette */}
              <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#tknDepth)" style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }} />
              <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#tknVignette)" style={{ pointerEvents: 'none' }} />

              {/* Rotated labels */}
              {TOKEN_SEGMENTS.map((seg) => {
                const midAngle = (seg.start + seg.end) / 2;
                const pos = polarToCartesian(CX, CY, (INNER_R + OUTER_R) / 2, midAngle);
                const rotAngle = getTextRotation(midAngle);
                return (
                  <text key={seg.label}
                    x={pos.x} y={pos.y}
                    textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="12" fontWeight="700"
                    transform={`rotate(${rotAngle}, ${pos.x}, ${pos.y})`}
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))', pointerEvents: 'none', letterSpacing: '0.04em' }}
                  >
                    {seg.label}
                  </text>
                );
              })}
            </motion.svg>

            {/* Spinning edge ring — same easing as wheel */}
            <motion.div
              className="absolute inset-0 z-[15] pointer-events-none"
              animate={{ rotate: ringRotation }}
              transition={{ duration: 3, ease: [0.15, 0.85, 0.35, 1] }}
              style={{ transformOrigin: '100px 100px', opacity: isSpinning ? 1 : 0, transition: 'opacity 0.2s ease-out' }}
            >
              <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="87" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeDasharray="45 180" strokeLinecap="round" />
                <circle cx="100" cy="100" r="87" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="20 200" strokeLinecap="round" style={{ transform: 'rotate(180deg)', transformOrigin: '100px 100px' }} />
              </svg>
            </motion.div>

            {/* Center hub */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[56px] h-[56px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 16px rgba(34,197,94,0.2), inset 0 2px 4px rgba(255,255,255,0.06)',
              }}
            >
              {isSpinning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={18} className="text-casino-accent" />
                </motion.div>
              ) : (
                <Sparkles size={18} className="text-casino-accent" />
              )}
            </div>
          </div>
        </div>

        {/* Win probability bar */}
        <div className="flex items-center gap-2 mb-6 text-xs text-casino-text-tertiary">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            <span>WIN 60%</span>
          </div>
          <span className="opacity-30">·</span>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span>MISS 40%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.button
              key="spin-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={spin}
              data-tour="token-spin"
              disabled={isSpinning}
              className={`btn-pill ${isSpinning ? 'opacity-40 cursor-not-allowed bg-white/5 text-casino-text-tertiary' : 'btn-gold'}`}
            >
              {isSpinning ? 'Spinning...' : 'Spin'}
            </motion.button>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              {result === 'WIN' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 text-casino-success"
                  >
                    <Trophy size={22} />
                    <span className="text-xl font-heading">Token Won!</span>
                  </motion.div>
                  <p className="text-xs text-casino-text-tertiary">You earned a Main Wheel spin</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-casino-text-tertiary">
                    <XCircle size={22} />
                    <span className="text-xl font-heading">Miss</span>
                  </div>
                  <p className="text-xs text-casino-text-tertiary">So close! Try another habit.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
