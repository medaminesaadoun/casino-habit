import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#e8b931', '#eab308', '#a855f7', '#ffffff', '#f472b6', '#facc15'];
const PARTICLE_COUNT = 50;

export default function JackpotConfetti() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
      const speed = 80 + Math.random() * 200;
      const size = 3 + Math.random() * 7;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = Math.random() > 0.5 ? 'circle' : 'rect';
      return { id: i, angle, speed, size, color, shape, delay: Math.random() * 0.3 };
    }),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" style={{ width: 340, height:340 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 170, y: 170, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: 170 + Math.cos(p.angle) * p.speed,
            y: 170 + Math.sin(p.angle) * p.speed,
            opacity: [1, 1, 0],
            rotate: Math.random() > 0.5 ? 180 : -180,
            scale: [1, 1.2, 0],
          }}
          transition={{ duration: 2.5, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.shape === 'circle' ? p.size : p.size * 1.5,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}50`,
          }}
        />
      ))}
    </div>
  );
}
