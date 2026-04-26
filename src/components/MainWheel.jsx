import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Lock, Zap } from 'lucide-react';
import { playSpinStart, playTickIfPassed, resetTickTracking, playSpinLand } from '../sounds';
import JackpotConfetti from './JackpotConfetti';

const NORMAL_SEGMENTS = [
  { label: 'Tier 1', color: '#ef4444', start: 0, end: 144, weight: 40 },
  { label: 'Tier 2', color: '#3b82f6', start: 144, end: 252, weight: 30 },
  { label: 'Tier 3', color: '#a855f7', start: 252, end: 324, weight: 20 },
  { label: 'Bonus', color: '#eab308', start: 324, end: 352.8, weight: 8 },
  { label: 'Jackpot', color: '#e8b931', start: 352.8, end: 360, weight: 2 },
];

const MEGA_SEGMENTS = [
  { label: 'Tier 1', color: '#ef4444', start: 0, end: 43.2, weight: 12 },
  { label: 'Tier 2', color: '#3b82f6', start: 43.2, end: 108, weight: 18 },
  { label: 'Tier 3', color: '#a855f7', start: 108, end: 198, weight: 25 },
  { label: 'Bonus', color: '#eab308', start: 198, end: 288, weight: 25 },
  { label: 'Jackpot', color: '#e8b931', start: 288, end: 360, weight: 20 },
];

const CX = 170;
const CY = 170;
const OUTER_R = 160;
const INNER_R = 62;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSegment(x, y, innerR, outerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(x, y, outerR, endAngle);
  const outerEnd = polarToCartesian(x, y, outerR, startAngle);
  const innerStart = polarToCartesian(x, y, innerR, endAngle);
  const innerEnd = polarToCartesian(x, y, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', outerStart.x, outerStart.y,
    'A', outerR, outerR, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

function getSegmentAtAngle(angle, segments) {
  const normalized = ((angle % 360) + 360) % 360;
  return segments.find((s) => normalized >= s.start && normalized < s.end) || segments[0];
}

function getRandomResult(isMega) {
  const rand = Math.random() * 100;
  if (isMega) {
    if (rand < 12) return 'Tier 1';
    if (rand < 30) return 'Tier 2';
    if (rand < 55) return 'Tier 3';
    if (rand < 80) return 'Bonus';
    return 'Jackpot';
  }
  if (rand < 40) return 'Tier 1';
  if (rand < 70) return 'Tier 2';
  if (rand < 90) return 'Tier 3';
  if (rand < 98) return 'Bonus';
  return 'Jackpot';
}

function getAngleInSegment(segmentLabel, segments) {
  const seg = segments.find((s) => s.label === segmentLabel);
  if (!seg) return 0;
  const padding = (seg.end - seg.start) * 0.12;
  return seg.start + padding + Math.random() * (seg.end - seg.start - padding * 2);
}

// Keeps label text readable (never more than 90° from horizontal)
function getTextRotation(midAngle) {
  const a = ((midAngle % 360) + 360) % 360;
  if (a > 90 && a <= 270) return a - 180;
  return a;
}

// Brighter shade of a hex color for the highlight edge
function lightenColor(hex, amount = 40) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export default function MainWheel({
  activeTier,
  spinTokens,
  canMegaSpin,
  isFreeJackpotSpin,
  onConsumeToken,
  onConsumeMegaToken,
  onSpinComplete,
  onShowConfetti,
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [megaMode, setMegaMode] = useState(false);
  const [hubPulse, setHubPulse] = useState(false);
  const [ringRotation, setRingRotation] = useState(0);
  const controls = useAnimation();
  const rotationRef = useRef(0);

  useEffect(() => {
    if (megaMode && !canMegaSpin) setMegaMode(false);
  }, [canMegaSpin, megaMode]);

  const segments = megaMode ? MEGA_SEGMENTS : NORMAL_SEGMENTS;
  const isLocked = isFreeJackpotSpin ? false : spinTokens < (megaMode ? 5 : 1);

  const ringMax = 5;
  const ringCircumference = 2 * Math.PI * 52;
  const ringDash = ringCircumference;
  const ringOffset = ringCircumference - (Math.min(spinTokens || 0, ringMax) / ringMax) * ringCircumference;

  const spinWheel = async () => {
    if (isSpinning || isLocked) return;
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    if (isFreeJackpotSpin) {
      playSpinStart();
      resetTickTracking();
      const seg = segments.find((s) => s.label === 'Jackpot');
      const padding = (seg.end - seg.start) * 0.12;
      const finalAngle = seg.start + padding + Math.random() * (seg.end - seg.start - padding * 2);
      const extraSpins = 5 + Math.floor(Math.random() * 3);
      const offset = 360 - finalAngle;
      const snapped = Math.floor(rotationRef.current / 360) * 360;
      rotationRef.current = snapped + extraSpins * 360 + offset;
      setRingRotation((prev) => prev + 10 * 360);
      await controls.start({ rotate: rotationRef.current, transition: { duration: 3.5, ease: [0.15, 0.85, 0.35, 1] } });
      setResult({ landed: 'Jackpot', effective: 'Jackpot', color: '#e8b931' });
      setShowResult(true);
      setIsSpinning(false);
      setHubPulse(false);
      playSpinLand('Jackpot');
      onSpinComplete({ landed: 'Jackpot', effective: 'Jackpot', isBonus: false }, { isMegaSpin: false, isFreeJackpot: true });
      return;
    }

    if (megaMode) onConsumeMegaToken();
    else onConsumeToken();
    playSpinStart();
    resetTickTracking();

    const actualResultLabel = getRandomResult(megaMode);
    const targetAngle = getAngleInSegment(actualResultLabel, segments);
    let finalAngle = targetAngle;
    const doNearMiss = Math.random() < 0.6 && actualResultLabel !== 'Jackpot';
    if (doNearMiss) {
      const actualIdx = segments.findIndex((s) => s.label === actualResultLabel);
      const higher = segments.filter((_, idx) => idx > actualIdx);
      if (higher.length > 0) {
        const nearSeg = higher[Math.floor(Math.random() * higher.length)];
        finalAngle = nearSeg.end + 2 + Math.random() * 8;
      }
    }

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const offset = 360 - finalAngle;
    const snapped = Math.floor(rotationRef.current / 360) * 360;
    rotationRef.current = snapped + extraSpins * 360 + offset;
    setRingRotation((prev) => prev + 10 * 360);

    await controls.start({ rotate: rotationRef.current, transition: { duration: 3.5, ease: [0.15, 0.85, 0.35, 1] } });

    const landed = getSegmentAtAngle(finalAngle, segments);
    let effectiveResult = landed.label;
    if (!megaMode) {
      if (effectiveResult === 'Tier 2' && activeTier < 2) effectiveResult = 'Tier 1';
      if (effectiveResult === 'Tier 3' && activeTier < 3) effectiveResult = activeTier >= 2 ? 'Tier 2' : 'Tier 1';
    }

    setResult({ landed: landed.label, effective: effectiveResult, color: landed.color });
    setShowResult(true);
    setIsSpinning(false);
    setHubPulse(false);
    playSpinLand(effectiveResult);
    onSpinComplete(
      { landed: landed.label, effective: effectiveResult, isBonus: effectiveResult === 'Bonus' },
      { isMegaSpin: megaMode, isFreeJackpot: false }
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative mb-8 ${isSpinning ? 'wheel-spin-pulse' : ''} ${megaMode || isFreeJackpotSpin ? 'mega-mode-active' : ''}`}>
        {/* Outer ambient glow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: isSpinning
              ? `0 0 ${megaMode ? '80px' : '60px'} color-mix(in srgb, var(--color-casino-accent) ${megaMode ? '30%' : '20%'}, transparent), 0 0 ${megaMode ? '160px' : '120px'} color-mix(in srgb, var(--color-casino-accent) ${megaMode ? '15%' : '10%'}, transparent)`
              : `0 0 ${megaMode ? '60px' : '40px'} color-mix(in srgb, var(--color-casino-accent) ${megaMode ? '18%' : '12%'}, transparent), 0 0 ${megaMode ? '120px' : '80px'} color-mix(in srgb, var(--color-casino-accent) ${megaMode ? '9%' : '6%'}, transparent)`,
            transition: 'box-shadow 0.5s ease',
          }}
        />

        {/* Free spin indicator */}
        {isFreeJackpotSpin && !isSpinning && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-casino-accent text-black shadow-lg shadow-casino-accent/30">
            <Zap size={12} /> FREE SPIN READY
          </div>
        )}

        {/* Pointer — larger diamond-tipped indicator */}
        <svg className="absolute -top-4 left-1/2 -translate-x-1/2 z-30" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <linearGradient id="ptrHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="ptrShadow" x="-30%" y="-10%" width="160%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.7)" />
            </filter>
            <filter id="ptrGlow" x="-30%" y="-10%" width="160%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Glow layer */}
          <path d="M18 44 L32 10 Q18 3 4 10 Z" fill="var(--color-casino-accent)" opacity="0.4" filter="url(#ptrGlow)" />
          {/* Main body */}
          <path d="M18 44 L32 10 Q18 3 4 10 Z" fill="var(--color-casino-accent)" filter="url(#ptrShadow)" />
          {/* Inner highlight */}
          <path d="M18 38 L28 12 Q18 7 8 12 Z" fill="url(#ptrHighlight)" />
          {/* Tip dot */}
          <circle cx="18" cy="44" r="4.5" fill="var(--color-casino-accent)" filter="url(#ptrShadow)" />
          <circle cx="18" cy="44" r="2.5" fill="rgba(255,255,255,0.7)" />
        </svg>

        {/* SVG Wheel */}
        <div
          className="relative"
          style={{ width: 340, height: 340 }}
        >
          <motion.svg
            width="340"
            height="340"
            viewBox="0 0 340 340"
            animate={controls}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') {
                playTickIfPassed(latest.rotate);
                // Track rotation delta for hub pulse intensity
                const delta = Math.abs(latest.rotate - (rotationRef.current - 360));
                if (delta > 5) setHubPulse(true);
              }
            }}
            style={{ transformOrigin: '170px 170px' }}
          >
            <defs>
              {/* Per-segment inner-edge highlight gradients */}
              {segments.map((seg, idx) => (
                <linearGradient
                  key={`grad-${idx}`}
                  id={`segGrad-${idx}`}
                  gradientUnits="userSpaceOnUse"
                  x1={CX} y1={CY}
                  x2={polarToCartesian(CX, CY, OUTER_R, (seg.start + seg.end) / 2).x}
                  y2={polarToCartesian(CX, CY, OUTER_R, (seg.start + seg.end) / 2).y}
                >
                  <stop offset="0%" stopColor={lightenColor(seg.color, 30)} stopOpacity="1" />
                  <stop offset="45%" stopColor={seg.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={seg.color} stopOpacity="0.85" />
                </linearGradient>
              ))}
              {/* Depth overlay gradient */}
              <radialGradient id="wheelDepth" cx="50%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                <stop offset="75%"  stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
              </radialGradient>
              {/* Outer edge vignette */}
              <radialGradient id="wheelVignette" cx="50%" cy="50%" r="50%">
                <stop offset="80%"  stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </radialGradient>
            </defs>

            {/* Segments with gradient fill */}
            {segments.map((seg, idx) => (
              <path
                key={seg.label}
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, seg.start, seg.end)}
                fill={`url(#segGrad-${idx})`}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1"
              />
            ))}

            {/* Decorative divider spokes between segments */}
            {segments.map((seg) => {
              const p1 = polarToCartesian(CX, CY, INNER_R + 2, seg.start);
              const p2 = polarToCartesian(CX, CY, OUTER_R - 2, seg.start);
              return (
                <line
                  key={`spoke-${seg.label}`}
                  x1={p1.x} y1={p1.y}
                  x2={p2.x} y2={p2.y}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Outer rim ring */}
            <circle cx={CX} cy={CY} r={OUTER_R - 1} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
            {/* Inner rim ring */}
            <circle cx={CX} cy={CY} r={INNER_R + 1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

            {/* Tick marks at segment boundaries on outer ring */}
            {segments.map((seg) => {
              const p = polarToCartesian(CX, CY, OUTER_R - 6, seg.start);
              return (
                <circle key={`tick-${seg.label}`} cx={p.x} cy={p.y} r={3} fill="rgba(255,255,255,0.55)" />
              );
            })}

            {/* Depth overlay */}
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#wheelDepth)" style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }} />
            {/* Outer vignette */}
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#wheelVignette)" style={{ pointerEvents: 'none' }} />

            {/* Rotated labels — follow segment angle, never upside-down */}
            {segments.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const labelR = (INNER_R + OUTER_R) / 2;
              const pos = polarToCartesian(CX, CY, labelR, midAngle);
              const rotAngle = getTextRotation(midAngle);
              const segSpan = seg.end - seg.start;
              const fontSize = segSpan < 15 ? 9 : segSpan < 30 ? 10 : 12;

              return (
                <text
                  key={`label-${seg.label}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="700"
                  transform={`rotate(${rotAngle}, ${pos.x}, ${pos.y})`}
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))', pointerEvents: 'none', letterSpacing: '0.02em' }}
                >
                  {seg.label}
                </text>
              );
            })}
          </motion.svg>

          {/* Spinning edge ring — same easing as wheel */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-[15]"
            animate={{ rotate: ringRotation }}
            transition={{ duration: 3.5, ease: [0.15, 0.85, 0.35, 1] }}
            style={{ transformOrigin: '170px 170px', opacity: isSpinning ? 1 : 0, transition: 'opacity 0.2s ease-out' }}
          >
            <svg viewBox="0 0 340 340" className="w-full h-full">
              <circle cx="170" cy="170" r="156" fill="none" stroke="var(--color-casino-accent)" strokeWidth="2.5" strokeDasharray="80 240" strokeLinecap="round" opacity="0.7" />
              <circle cx="170" cy="170" r="156" fill="none" stroke="white" strokeWidth="1" strokeDasharray="40 280" strokeLinecap="round" opacity="0.5" />
            </svg>
          </motion.div>

          {/* Center Hub with progress ring */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
            style={{ width: 120, height: 120 }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="var(--color-casino-accent)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={ringDash}
                strokeDashoffset={ringOffset}
                style={{
                  filter: `drop-shadow(0 0 ${megaMode ? '10px' : '6px'} color-mix(in srgb, var(--color-casino-accent) ${megaMode ? '60%' : '40%'}, transparent))`,
                  transition: 'stroke-dashoffset 0.4s ease',
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                }}
              />
            </svg>

            <div
              className={`relative w-[84px] h-[84px] rounded-full flex items-center justify-center ${megaMode || isFreeJackpotSpin ? 'mega-hub-glow' : ''}`}
              style={{
                background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                border: `2px solid ${megaMode || isFreeJackpotSpin ? 'var(--color-casino-accent)' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: megaMode || isFreeJackpotSpin
                  ? '0 0 30px color-mix(in srgb, var(--color-casino-accent) 40%, transparent), inset 0 2px 4px rgba(255,255,255,0.08)'
                  : '0 0 20px color-mix(in srgb, var(--color-casino-accent) 20%, transparent), inset 0 2px 4px rgba(255,255,255,0.06)',
                transition: 'all 0.4s ease',
              }}
            >
              {isSpinning ? (
                <motion.div
                  animate={hubPulse ? { rotate: 360, scale: [1, 1.3, 1] } : { rotate: 360 }}
                  transition={{ rotate: { duration: megaMode ? 1.2 : 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.3, type: 'spring' } }}
                >
                  <Sparkles size={24} className="text-casino-accent" />
                </motion.div>
              ) : isFreeJackpotSpin ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <Zap size={24} className="text-casino-accent" />
                </motion.div>
              ) : (
                <Sparkles size={24} className="text-casino-accent" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMegaMode(false)}
          disabled={isSpinning}
          className={`text-xs px-4 py-2 rounded-full font-semibold transition-all ${
            !megaMode
              ? 'bg-casino-accent text-black shadow-lg'
              : 'text-casino-text-tertiary hover:text-casino-text-secondary glass'
          }`}
          style={!megaMode ? { boxShadow: '0 0 16px color-mix(in srgb, var(--color-casino-accent) 40%, transparent)' } : {}}
        >
          Normal · 1 token
        </button>
        <button
          onClick={() => canMegaSpin && setMegaMode(true)}
          disabled={isSpinning || !canMegaSpin}
          className={`text-xs px-4 py-2 rounded-full font-semibold transition-all ${
            megaMode
              ? 'bg-casino-accent text-black shadow-lg'
              : canMegaSpin
              ? 'text-casino-text-tertiary hover:text-casino-text-secondary glass'
              : 'text-casino-text-tertiary/30 glass cursor-not-allowed'
          }`}
          style={megaMode ? { boxShadow: '0 0 16px color-mix(in srgb, var(--color-casino-accent) 40%, transparent)' } : {}}
        >
          Mega · 5 tokens
        </button>
      </div>

      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || isLocked}
        className={`btn-pill text-base font-bold tracking-wide px-12 py-4 ${
          isSpinning || isLocked
            ? 'opacity-40 cursor-not-allowed bg-white/5 text-casino-text-tertiary'
            : megaMode || isFreeJackpotSpin
            ? 'mega-spin-btn'
            : 'btn-gold'
        }`}
      >
        {isSpinning ? 'Spinning...'
          : isLocked ? <><Lock size={18} />{megaMode ? 'Need 5 Tokens' : 'Complete a Habit'}</>
          : isFreeJackpotSpin ? <><Zap size={18} />FREE SPIN</>
          : megaMode ? 'MEGA SPIN'
          : 'SPIN'}
      </button>

      {/* Result card */}
      {showResult && result && (
        <>
          {result.effective === 'Jackpot' && onShowConfetti?.()}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: [0.3, 1.08, 0.95, 1] }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
            className="mt-6 glass p-5 text-center max-w-xs w-full relative overflow-hidden result-flash"
            style={{ borderTop: `3px solid ${result.color}`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${result.color}20` }}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${result.color}, transparent 70%)` }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold mb-1"
              style={{ color: result.color, textShadow: `0 0 24px ${result.color}50` }}
            >
              {result.landed}
            </motion.div>
            {result.landed !== result.effective && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs text-casino-text-tertiary mb-1">
                Tier not active — awarded {result.effective}
              </motion.p>
            )}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-casino-text-secondary">
              You won a <span className="font-semibold" style={{ color: result.color }}>{result.effective}</span> reward
            </motion.p>
          </motion.div>
        </>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-casino-text-tertiary max-w-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}60` }} />
            <span className="font-medium" style={{ color: seg.color }}>{seg.label}</span>
            <span className="tabular-nums opacity-60">{seg.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
