import React, { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Sparkles, XCircle, Trophy } from 'lucide-react';
import { playSpinStart, playTickIfPassed, resetTickTracking, playTokenWin, playTokenMiss } from '../sounds';

const WIN_END = 216;

export default function TokenWheel({ onComplete }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const controls = useAnimation();

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

    const targetRotation = baseSpins * 360 + (360 - finalAngle);
    await controls.start({
      rotate: targetRotation,
      transition: { duration: 3, ease: [0.15, 0.85, 0.35, 1] },
    });

    setResult(actualResult);
    setShowResult(true);
    setIsSpinning(false);
    if (actualResult === 'WIN') playTokenWin();
    else playTokenMiss();

    setTimeout(() => { onComplete(actualResult === 'WIN'); }, 1800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="modal-panel flex flex-col items-center">
        <h2 className="text-lg font-bold text-white mb-1">Spin for Token</h2>
        <p className="text-xs text-casino-text-tertiary mb-6">60% chance to win a spin</p>

        <div className="relative mb-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '16px solid var(--color-casino-accent)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <motion.div
            animate={controls}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') {
                playTickIfPassed(latest.rotate);
              }
            }}
            className="rounded-full relative"
            style={{ width: 200, height: 200, background: `conic-gradient(#22c55e 0deg ${WIN_END}deg, #44403c ${WIN_END}deg 360deg)`, boxShadow: '0 0 30px rgba(0,0,0,0.4)' }}
          >
            <span className="absolute text-xs font-bold text-white" style={{ left: '60%', top: '65%', transform: 'translate(-50%, -50%)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>WIN</span>
            <span className="absolute text-xs font-bold text-white/50" style={{ left: '25%', top: '25%', transform: 'translate(-50%, -50%)' }}>MISS</span>
            <div className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center glass">
              <Sparkles size={16} className="text-casino-accent" />
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.button key="spin-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={spin} disabled={isSpinning}
              className={`btn-pill ${isSpinning ? 'opacity-40 cursor-not-allowed bg-white/5 text-casino-text-tertiary' : 'btn-gold'}`}>
              {isSpinning ? 'Spinning...' : 'Spin'}
            </motion.button>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2">
              {result === 'WIN' ? (
                <>
                  <div className="flex items-center gap-2 text-casino-success">
                    <Trophy size={20} /><span className="text-xl font-bold">Token Won!</span>
                  </div>
                  <p className="text-xs text-casino-text-tertiary">You earned a Main Wheel spin</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-casino-text-tertiary">
                    <XCircle size={20} /><span className="text-xl font-bold">Miss</span>
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