import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Lock, Zap } from 'lucide-react';
import { playSpinStart, playTickIfPassed, resetTickTracking, playSpinLand } from '../sounds';

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

export default function MainWheel({
  activeTier,
  spinTokens,
  canMegaSpin,
  isFreeJackpotSpin,
  onConsumeToken,
  onConsumeMegaToken,
  onSpinComplete,
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [megaMode, setMegaMode] = useState(false);
  const controls = useAnimation();
  const rotationRef = useRef(0);

  // Auto-revert mega mode if tokens drop below 5
  useEffect(() => {
    if (megaMode && !canMegaSpin) setMegaMode(false);
  }, [canMegaSpin, megaMode]);

  const segments = megaMode ? MEGA_SEGMENTS : NORMAL_SEGMENTS;
  const isLocked = isFreeJackpotSpin ? false : spinTokens < (megaMode ? 5 : 1);

  // Progress ring: max 5 tokens shown, each fills 1/5 of ring
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
      // Free jackpot spin: no cost, force jackpot
      playSpinStart();
      resetTickTracking();
      const seg = segments.find((s) => s.label === 'Jackpot');
      const padding = (seg.end - seg.start) * 0.12;
      const finalAngle = seg.start + padding + Math.random() * (seg.end - seg.start - padding * 2);
      const extraSpins = 5 + Math.floor(Math.random() * 3);
      const offset = 360 - finalAngle;
      // Snap to clean multiple of 360 so visual pointer always matches result
      const snapped = Math.floor(rotationRef.current / 360) * 360;
      rotationRef.current = snapped + extraSpins * 360 + offset;

      await controls.start({
        rotate: rotationRef.current,
        transition: { duration: 3.5, ease: [0.15, 0.85, 0.35, 1] },
      });

      setResult({ landed: 'Jackpot', effective: 'Jackpot', color: '#e8b931' });
      setShowResult(true);
      setIsSpinning(false);
      playSpinLand('Jackpot');
      onSpinComplete(
        { landed: 'Jackpot', effective: 'Jackpot', isBonus: false },
        { isMegaSpin: false, isFreeJackpot: true }
      );
      return;
    }

    if (megaMode) {
      onConsumeMegaToken();
    } else {
      onConsumeToken();
    }
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
    // Snap to clean multiple of 360 so visual pointer always matches result
    const snapped = Math.floor(rotationRef.current / 360) * 360;
    rotationRef.current = snapped + extraSpins * 360 + offset;

    await controls.start({
      rotate: rotationRef.current,
      transition: { duration: 3.5, ease: [0.15, 0.85, 0.35, 1] },
    });

    const landed = getSegmentAtAngle(finalAngle, segments);
    let effectiveResult = landed.label;
    // Mega spin ignores tier gating — you get what you land
    if (!megaMode) {
      if (effectiveResult === 'Tier 2' && activeTier < 2) effectiveResult = 'Tier 1';
      if (effectiveResult === 'Tier 3' && activeTier < 3) effectiveResult = activeTier >= 2 ? 'Tier 2' : 'Tier 1';
    }

    setResult({ landed: landed.label, effective: effectiveResult, color: landed.color });
    setShowResult(true);
    setIsSpinning(false);
    playSpinLand(effectiveResult);

    onSpinComplete(
      { landed: landed.label, effective: effectiveResult, isBonus: effectiveResult === 'Bonus' },
      { isMegaSpin: megaMode, isFreeJackpot: false }
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Wheel container */}
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

        {/* SVG Pointer — sits above the wheel */}
        <svg className="absolute -top-2 left-1/2 -translate-x-1/2 z-30" width="24" height="28" viewBox="0 0 24 28">
          <defs>
            <filter id="ptrShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>
          <path
            d="M12 26 L22 6 Q12 2 2 6 Z"
            fill="var(--color-casino-accent)"
            filter="url(#ptrShadow)"
          />
          <path d="M12 22 L18 8 Q12 6 6 8 Z" fill="rgba(255,255,255,0.2)" />
        </svg>

        {/* SVG Wheel */}
        <div className="relative" style={{ width: 340, height: 340 }}>
          <motion.svg
            width="340"
            height="340"
            viewBox={`0 0 340 340`}
            animate={controls}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') {
                playTickIfPassed(latest.rotate);
              }
            }}
            style={{ transformOrigin: '170px 170px' }}
          >
            {/* Segments — solid colors, no gradients */}
            {segments.map((seg) => (
              <path
                key={seg.label}
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, seg.start, seg.end)}
                fill={seg.color}
                fillOpacity={megaMode ? '0.95' : '0.9'}
                stroke={megaMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)'}
                strokeWidth={megaMode ? '2' : '1.5'}
              />
            ))}



            {/* Upright labels */}
            {segments.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const labelR = (INNER_R + OUTER_R) / 2;
              const pos = polarToCartesian(CX, CY, labelR, midAngle);
              return (
                <text
                  key={`label-${seg.label}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)', pointerEvents: 'none' }}
                >
                  {seg.label}
                </text>
              );
            })}
          </motion.svg>

          {/* Center Hub — glassmorphic with progress ring */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
            style={{ width: 120, height: 120 }}
          >
            {/* Progress ring background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
              {/* Background track */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              {/* Active arc */}
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--color-casino-accent)"
                strokeWidth="3"
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

            {/* Hub body */}
            <div
              className={`relative w-[84px] h-[84px] rounded-full flex items-center justify-center ${megaMode || isFreeJackpotSpin ? 'mega-hub-glow' : ''}`}
              style={{
                background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                border: `2px solid ${megaMode || isFreeJackpotSpin ? 'var(--color-casino-accent)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: megaMode || isFreeJackpotSpin
                  ? '0 0 30px color-mix(in srgb, var(--color-casino-accent) 40%, transparent), inset 0 2px 4px rgba(255,255,255,0.06)'
                  : '0 0 20px color-mix(in srgb, var(--color-casino-accent) 20%, transparent), inset 0 2px 4px rgba(255,255,255,0.06)',
                transition: 'all 0.4s ease',
              }}
            >
              {isSpinning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: megaMode ? 1.2 : 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={24} className="text-casino-accent" />
                </motion.div>
              ) : isFreeJackpotSpin ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Zap size={24} className="text-casino-accent" />
                </motion.div>
              ) : (
                <Sparkles size={24} className="text-casino-accent" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spin mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMegaMode(false)}
          disabled={isSpinning}
          className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
            !megaMode
              ? 'bg-casino-accent text-black font-bold border-casino-accent'
              : 'text-casino-text-tertiary border-transparent hover:text-casino-text-secondary'
          }`}
        >
          Normal (1)
        </button>
        <button
          onClick={() => canMegaSpin && setMegaMode(true)}
          disabled={isSpinning || !canMegaSpin}
          className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
            megaMode
              ? 'bg-casino-accent text-black font-bold border-casino-accent'
              : canMegaSpin
              ? 'text-casino-text-tertiary border-transparent hover:text-casino-text-secondary'
              : 'text-casino-text-tertiary/40 border-transparent cursor-not-allowed'
          }`}
        >
          Mega (5)
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
        {isSpinning ? (
          'Spinning...'
        ) : isLocked ? (
          <>
            <Lock size={18} />
            {isFreeJackpotSpin ? 'Free Spin' : megaMode ? 'Need 5 Tokens' : 'Complete a Habit'}
          </>
        ) : isFreeJackpotSpin ? (
          <>
            <Zap size={18} />
            FREE SPIN
          </>
        ) : megaMode ? (
          'MEGA SPIN'
        ) : (
          'SPIN'
        )}
      </button>

      {/* Result */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-6 glass p-5 text-center max-w-xs w-full"
        >
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-casino-text-tertiary mb-1"
            >
              Tier not active — awarded {result.effective}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-casino-text-secondary"
          >
            You won a <span className="font-semibold" style={{ color: result.color }}>{result.effective}</span> reward
          </motion.p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-5 flex gap-4 text-xs text-casino-text-tertiary">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}60` }} />
            <span className="tabular-nums">{seg.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
