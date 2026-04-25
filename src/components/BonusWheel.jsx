import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Timer, Zap, X } from 'lucide-react';
import { playSpinStart, playTickIfPassed, resetTickTracking, playSpinLand, playTimerTick } from '../sounds';

const BONUS_SEGMENTS = [
  { label: '75%', color: '#22c55e', start: 0, end: 120, weight: 33.3 },
  { label: '50%', color: '#3b82f6', start: 120, end: 210, weight: 25 },
  { label: '25%', color: '#a855f7', start: 210, end: 270, weight: 16.7 },
  { label: 'FREE', color: '#e8b931', start: 270, end: 315, weight: 12.5 },
  { label: 'EXTRA', color: '#eab308', start: 315, end: 360, weight: 12.5 },
];

const rotationRef = { current: 0 };

const CX = 150;
const CY = 150;
const OUTER_R = 140;
const INNER_R = 50;

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

function getBonusSegmentAtAngle(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  return BONUS_SEGMENTS.find((s) => normalized >= s.start && normalized < s.end) || BONUS_SEGMENTS[0];
}

function getRandomBonusResult() {
  const rand = Math.random() * 100;
  if (rand < 33.3) return '75%';
  if (rand < 58.3) return '50%';
  if (rand < 75) return '25%';
  if (rand < 87.5) return 'FREE';
  return 'EXTRA';
}

function getBonusAngleForSegment(segmentLabel) {
  const seg = BONUS_SEGMENTS.find((s) => s.label === segmentLabel);
  if (!seg) return 0;
  const padding = (seg.end - seg.start) * 0.2;
  return seg.start + padding + Math.random() * (seg.end - seg.start - padding * 2);
}

function getTextRotation(midAngle) {
  const a = ((midAngle % 360) + 360) % 360;
  if (a > 90 && a <= 270) return a - 180;
  return a;
}

function lightenColor(hex, amount = 35) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export default function BonusWheel({ onBonusComplete, onExtraSpin }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const controls = useAnimation();
  const timerRef = useRef(null);

  useEffect(() => {
    rotationRef.current = 0;
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        playTimerTick();
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            onBonusComplete({ result: result?.label, claimed: false, timedOut: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft, result, onBonusComplete]);

  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    setTimerActive(false);
    setTimeLeft(600);
    playSpinStart();
    resetTickTracking();

    const actualResultLabel = getRandomBonusResult();
    const actualAngle = getBonusAngleForSegment(actualResultLabel);
    const baseSpins = 4;
    const offset = 360 - actualAngle;
    const snapped = Math.floor(rotationRef.current / 360) * 360;
    rotationRef.current = snapped + baseSpins * 360 + offset;

    await controls.start({ rotate: rotationRef.current, transition: { duration: 3.5, ease: [0.2, 0.8, 0.2, 1] } });

    const landedSegment = getBonusSegmentAtAngle(actualAngle);
    setResult(landedSegment);
    setIsSpinning(false);
    playSpinLand(landedSegment.label);

    if (landedSegment.label === 'FREE') {
      setTimeout(() => { onBonusComplete({ result: 'FREE', claimed: true }); }, 1500);
    } else if (landedSegment.label === 'EXTRA') {
      // user must click claim
    } else {
      setTimerActive(true);
    }
  };

  const claimClip = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    onBonusComplete({ result: result?.label, claimed: true, timedOut: false });
  };

  const dismissChallenge = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    onBonusComplete({ result: result?.label, claimed: false, dismissed: true });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative mb-8 ${isSpinning ? 'wheel-spin-pulse' : ''}`}>
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: isSpinning
              ? '0 0 60px color-mix(in srgb, var(--color-casino-accent) 20%, transparent), 0 0 120px color-mix(in srgb, var(--color-casino-accent) 10%, transparent)'
              : '0 0 40px color-mix(in srgb, var(--color-casino-accent) 12%, transparent), 0 0 80px color-mix(in srgb, var(--color-casino-accent) 6%, transparent)',
            transition: 'box-shadow 0.5s ease',
          }}
        />

        {/* Pointer */}
        <svg className="absolute -top-4 left-1/2 -translate-x-1/2 z-30" width="30" height="38" viewBox="0 0 30 38">
          <defs>
            <linearGradient id="bonusPtrHL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="bonusPtrShadow" x="-30%" y="-10%" width="160%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.7)" />
            </filter>
          </defs>
          <path d="M15 36 L27 9 Q15 3 3 9 Z" fill="var(--color-casino-accent)" filter="url(#bonusPtrShadow)" />
          <path d="M15 30 L23 11 Q15 7 7 11 Z" fill="url(#bonusPtrHL)" />
          <circle cx="15" cy="36" r="4" fill="var(--color-casino-accent)" filter="url(#bonusPtrShadow)" />
          <circle cx="15" cy="36" r="2" fill="rgba(255,255,255,0.7)" />
        </svg>

        <div className="relative" style={{ width: 300, height: 300, filter: isSpinning ? 'blur(1.5px)' : 'blur(0px)', transition: 'filter 0.3s ease-out' }}>
          <motion.svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            animate={controls}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') playTickIfPassed(latest.rotate);
            }}
            style={{ transformOrigin: '150px 150px' }}
          >
            <defs>
              {BONUS_SEGMENTS.map((seg, idx) => (
                <linearGradient
                  key={`bgrad-${idx}`}
                  id={`bsegGrad-${idx}`}
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
              <radialGradient id="bonusDepth" cx="50%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                <stop offset="55%"  stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </radialGradient>
              <radialGradient id="bonusVignette" cx="50%" cy="50%" r="50%">
                <stop offset="75%"  stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>
            </defs>

            {/* Segments */}
            {BONUS_SEGMENTS.map((seg, idx) => (
              <path
                key={seg.label}
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, seg.start, seg.end)}
                fill={`url(#bsegGrad-${idx})`}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1"
              />
            ))}

            {/* Divider spokes */}
            {BONUS_SEGMENTS.map((seg) => {
              const p1 = polarToCartesian(CX, CY, INNER_R + 2, seg.start);
              const p2 = polarToCartesian(CX, CY, OUTER_R - 2, seg.start);
              return (
                <line key={`bspoke-${seg.label}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              );
            })}

            {/* Rim rings */}
            <circle cx={CX} cy={CY} r={OUTER_R - 1} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
            <circle cx={CX} cy={CY} r={INNER_R + 1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

            {/* Boundary ticks */}
            {BONUS_SEGMENTS.map((seg) => {
              const p = polarToCartesian(CX, CY, OUTER_R - 6, seg.start);
              return <circle key={`btick-${seg.label}`} cx={p.x} cy={p.y} r={3} fill="rgba(255,255,255,0.55)" />;
            })}

            {/* Depth + vignette overlays */}
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#bonusDepth)" style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }} />
            <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#bonusVignette)" style={{ pointerEvents: 'none' }} />

            {/* Rotated labels */}
            {BONUS_SEGMENTS.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const labelR = (INNER_R + OUTER_R) / 2;
              const pos = polarToCartesian(CX, CY, labelR, midAngle);
              const rotAngle = getTextRotation(midAngle);
              const segSpan = seg.end - seg.start;
              const fontSize = segSpan < 30 ? 10 : 12;
              return (
                <text
                  key={`blabel-${seg.label}`}
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill="white" fontSize={fontSize} fontWeight="700"
                  transform={`rotate(${rotAngle}, ${pos.x}, ${pos.y})`}
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))', pointerEvents: 'none', letterSpacing: '0.02em' }}
                >
                  {seg.label}
                </text>
              );
            })}
          </motion.svg>

          {/* Center Hub */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
            style={{ width: 100, height: 100 }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={0}
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))', transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
              />
            </svg>
            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                border: '2px solid rgba(34,197,94,0.3)',
                boxShadow: '0 0 20px rgba(34,197,94,0.2), inset 0 2px 4px rgba(255,255,255,0.06)',
              }}
            >
              {isSpinning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Zap size={22} className="text-casino-success" />
                </motion.div>
              ) : (
                <Zap size={22} className="text-casino-success" />
              )}
            </div>
          </div>
        </div>
      </div>

      {!timerActive && !result && (
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`btn-pill text-base font-bold tracking-wide px-12 py-4 ${
            isSpinning ? 'opacity-40 cursor-not-allowed bg-white/5 text-casino-text-tertiary' : 'btn-gold'
          }`}
        >
          {isSpinning ? 'Spinning...' : 'Spin Bonus'}
        </button>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass p-5 text-center max-w-xs w-full relative overflow-hidden"
          style={{ borderTop: `3px solid ${result.color}`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${result.color}20` }}
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${result.color}, transparent 70%)` }} />
          <div className="text-xl font-bold mb-1" style={{ color: result.color, textShadow: `0 0 16px ${result.color}40` }}>
            {result.label}
          </div>
          {result.label === 'FREE' && <p className="text-sm text-casino-text-secondary">You got a free clip!</p>}
          {result.label === 'EXTRA' && (
            <div className="space-y-3">
              <p className="text-sm text-casino-text-secondary">You won a free Main Wheel spin!</p>
              <button onClick={() => { onExtraSpin(); }} className="btn-pill btn-gold w-full">Claim Free Spin</button>
            </div>
          )}
          {['75%', '50%', '25%'].includes(result.label) && (
            <>
              <p className="text-sm text-casino-text-secondary mb-3">
                Do <span className="font-bold text-white">{result.label}</span> of your habit to earn a clip
              </p>
              {timerActive && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-casino-danger tabular-nums">
                    <Timer size={24} />{formatTime(timeLeft)}
                  </div>
                  <button onClick={claimClip} className="btn-pill btn-gold w-full">I Did It! Claim Clip</button>
                  <button onClick={dismissChallenge} className="text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors">
                    Maybe Another Time
                  </button>
                  <p className="text-[10px] text-casino-text-tertiary">Complete within the time limit</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs text-casino-text-tertiary max-w-xs">
        {BONUS_SEGMENTS.map((seg) => (
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
