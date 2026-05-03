import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#ffd60a', '#eab308', '#f72585', '#ffffff', '#f472b6', '#facc15'];
const COUNT = 50;

export default function JackpotConfetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const fromLeft = i % 2 === 0;
        return {
          id: i,
          fromLeft,
          x: fromLeft ? -30 : window.innerWidth + 30,
          y: 60 + Math.random() * (window.innerHeight * 0.35),
          targetX: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          targetY: window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.5,
          size: 3 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
          delay: Math.random() * 0.3,
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ willChange: 'transform' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: p.x,
            y: p.y,
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            x: p.targetX,
            y: p.targetY,
            opacity: [1, 1, 0],
            rotate: p.fromLeft ? 540 : -540,
            scale: [1, 1.2, 0.4],
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: [0.15, 0.6, 0.2, 1],
          }}
          style={{
            position: 'absolute',
            width: p.shape === 'circle' ? p.size : p.size * 1.8,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}60`,
          }}
        />
      ))}
    </div>
  );
}
