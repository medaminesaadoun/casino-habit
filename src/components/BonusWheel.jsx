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

export default function BonusWheel({ onBonusComplete, onExtraSpin }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const controls = useAnimation();
  const timerRef = useRef(null);

  // Reset rotation when BonusWheel opens so spins always start clean
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
    // Snap to clean multiple of 360 so visual pointer always matches result
    const snapped = Math.floor(rotationRef.current / 360) * 360;
    rotationRef.current = snapped + baseSpins * 360 + offset;

    await controls.start({
      rotate: rotationRef.current,
      transition: { duration: 3.5, ease: [0.2, 0.8, 0.2, 1] },
    });

    const landedSegment = getBonusSegmentAtAngle(actualAngle);
    setResult(landedSegment);
    setIsSpinning(false);
    playSpinLand(landedSegment.label);

    if (landedSegment.label === 'FREE') {
      // Show result briefly before auto-claiming
      setTimeout(() => {
        onBonusComplete({ result: 'FREE', claimed: true });
      }, 1500);
    } else if (landedSegment.label === 'EXTRA') {
      // EXTRA shows result card with claim button — user clicks to claim
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
      {/* Wheel container */}
      <div className={`relative mb-8 ${isSpinning ? 'wheel-spin-pulse' : ''}`}>
        {/* Outer ambient glow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: isSpinning
              ? '0 0 60px color-mix(in srgb, var(--color-casino-accent) 20%, transparent), 0 0 120px color-mix(in srgb, var(--color-casino-accent) 10%, transparent)'
              : '0 0 40px color-mix(in srgb, var(--color-casino-accent) 12%, transparent), 0 0 80px color-mix(in srgb, var(--color-casino-accent) 6%, transparent)',
            transition: 'box-shadow 0.5s ease',
          }}
        />

        {/* SVG Pointer */}
        <svg className="absolute -top-2 left-1/2 -translate-x-1/2 z-30" width="24" height="28" viewBox="0 0 24 28">
          <defs>
            <filter id="bonusPtrShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>
          <path
            d="M12 26 L22 6 Q12 2 2 6 Z"
            fill="var(--color-casino-accent)"
            filter="url(#bonusPtrShadow)"
          />
          <path d="M12 22 L18 8 Q12 6 6 8 Z" fill="rgba(255,255,255,0.2)" />
        </svg>

        {/* SVG Wheel */}
        <div className="relative" style={{ width: 300, height: 300 }}>
          <motion.svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            animate={controls}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') {
                playTickIfPassed(latest.rotate);
              }
            }}
            style={{ transformOrigin: '150px 150px' }}
          >
            {/* Segments — solid colors */}
            {BONUS_SEGMENTS.map((seg) => (
              <path
                key={seg.label}
                d={describeDonutSegment(CX, CY, INNER_R, OUTER_R, seg.start, seg.end)}
                fill={seg.color}
                fillOpacity="0.9"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
              />
            ))}



            {/* Upright labels */}
            {BONUS_SEGMENTS.map((seg) => {
              const midAngle = (seg.start + seg.end) / 2;
              const labelR = (INNER_R + OUTER_R) / 2;
              const pos = polarToCartesian(CX, CY, labelR, midAngle);
              return (
                <text
                  key={`bonus-label-${seg.label}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="11"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)', pointerEvents: 'none' }}
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
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={0}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.4))',
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50px 50px',
                }}
              />
            </svg>
            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-casino-surface), var(--color-casino-bg))',
                border: '2px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 20px color-mix(in srgb, #22c55e 20%, transparent), inset 0 2px 4px rgba(255,255,255,0.06)',
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

      {/* Spin button — hidden when a result is showing (FREE/EXTRA) so user must claim first */}
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

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass p-5 text-center max-w-xs w-full"
        >
          <div
            className="text-xl font-bold mb-1"
            style={{ color: result.color, textShadow: `0 0 16px ${result.color}40` }}
          >
            {result.label}
          </div>
          {result.label === 'FREE' && (
            <p className="text-sm text-casino-text-secondary">You got a free clip!</p>
          )}
          {result.label === 'EXTRA' && (
            <div className="space-y-3">
              <p className="text-sm text-casino-text-secondary">You won a free Main Wheel spin!</p>
              <button onClick={() => { onExtraSpin(); }} className="btn-pill btn-gold w-full">
                Claim Free Spin
              </button>
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
                    <Timer size={24} />
                    {formatTime(timeLeft)}
                  </div>
                  <button onClick={claimClip} className="btn-pill btn-gold w-full">
                    I Did It! Claim Clip
                  </button>
                  <button
                    onClick={dismissChallenge}
                    className="text-xs text-casino-text-tertiary hover:text-casino-text-secondary transition-colors"
                  >
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
      <div className="mt-5 flex gap-4 text-xs text-casino-text-tertiary">
        {BONUS_SEGMENTS.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}60` }}
            />
            <span className="tabular-nums">{seg.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
