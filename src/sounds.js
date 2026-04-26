// Web Audio API Sound Synthesizer for Casino Habit
// Rich, layered, context-appropriate synthesis — no external files

let audioCtx = null;
let masterGain = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, master: masterGain };
}

export function toggleMute() {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.35, getAudioContext().ctx.currentTime, 0.1);
  }
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

function now() {
  return getAudioContext().ctx.currentTime;
}

// ===== HELPERS =====

function makeOsc(type, freq, detune = 0) {
  const { ctx } = getAudioContext();
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  return osc;
}

function makeGain(val) {
  const { ctx } = getAudioContext();
  const g = ctx.createGain();
  g.gain.value = val;
  return g;
}

function makeFilter(type, freq, Q = 1) {
  const { ctx } = getAudioContext();
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = Q;
  return f;
}

function env(gainNode, t, attack, decay, sustainLevel, release) {
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, t + attack);
  gainNode.gain.setTargetAtTime(sustainLevel * 0.3, t + attack + decay, release);
}

// ===== SOUNDS =====

// 1. Habit Complete — bright casino ding with warm body
export function playComplete() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // Layer 1: bright main ding (triangle + sine for bell-like attack)
  const osc1 = makeOsc('triangle', 1046.50, 4);
  const osc2 = makeOsc('sine', 1046.50, -3);
  const g1 = makeGain(0);
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.28, t + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc1.connect(g1); osc2.connect(g1);
  g1.connect(master);
  osc1.start(t); osc2.start(t);
  osc1.stop(t + 0.5); osc2.stop(t + 0.5);

  // Layer 2: bright fifth above for sparkle
  const osc3 = makeOsc('sine', 1567.98, -1);
  const g2 = makeGain(0);
  g2.gain.setValueAtTime(0, t + 0.04);
  g2.gain.linearRampToValueAtTime(0.15, t + 0.045);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc3.connect(g2);
  g2.connect(master);
  osc3.start(t + 0.04);
  osc3.stop(t + 0.45);

  // Layer 3: fast decaying high sparkle
  const osc4 = makeOsc('sine', 2093.00, 3);
  const g3 = makeGain(0);
  g3.gain.setValueAtTime(0, t + 0.08);
  g3.gain.linearRampToValueAtTime(0.1, t + 0.085);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc4.connect(g3);
  g3.connect(master);
  osc4.start(t + 0.08);
  osc4.stop(t + 0.3);
}

// 2. Clip Drop — poker chip rattle with multi-tap cascade
export function playClipDrop() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  function chipHit(startTime, freq, vol, dur) {
    const osc1 = makeOsc('sine', freq, 0);
    const osc2 = makeOsc('triangle', freq * 1.02, 2);
    const g = makeGain(0);
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.001);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    osc1.connect(g); osc2.connect(g);
    g.connect(master);
    osc1.start(startTime); osc2.start(startTime);
    osc1.stop(startTime + dur); osc2.stop(startTime + dur);
  }

  // Fast cascade of chip taps — acrylic/rattle resonance
  chipHit(t, 3200, 0.35, 0.08);
  chipHit(t + 0.035, 2800, 0.25, 0.07);
  chipHit(t + 0.07, 2400, 0.2, 0.06);
  chipHit(t + 0.095, 3600, 0.15, 0.05);
  chipHit(t + 0.12, 2000, 0.12, 0.06);

  // Subtle noise rattle layer
  const bufSize = ctx.sampleRate * 0.06;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = makeFilter('highpass', 4000, 4);
  const ng = makeGain(0);
  ng.gain.setValueAtTime(0.15, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  noise.connect(bp);
  bp.connect(ng);
  ng.connect(master);
  noise.start(t);
}

// 3. Spin Start — slot lever tension with metallic scrape + click
export function playSpinStart() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // Layer 1: tension build — rising filter sweep
  const osc = makeOsc('sawtooth', 80, 0);
  const filter = makeFilter('lowpass', 150, 3);
  const g = makeGain(0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.15, t + 0.05);
  g.gain.linearRampToValueAtTime(0.08, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
  filter.frequency.setValueAtTime(150, t);
  filter.frequency.exponentialRampToValueAtTime(3000, t + 0.3);
  osc.connect(filter);
  filter.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.4);

  // Layer 2: metallic scrape (bandpassed noise)
  const bufSize = ctx.sampleRate * 0.12;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = makeFilter('bandpass', 2500, 8);
  const ng = makeGain(0);
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.12, t + 0.04);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  noise.connect(bp);
  bp.connect(ng);
  ng.connect(master);
  noise.start(t);

  // Layer 3: crisp lever click at end
  const click = makeOsc('triangle', 1800, 0);
  const cg = makeGain(0);
  cg.gain.setValueAtTime(0, t + 0.25);
  cg.gain.linearRampToValueAtTime(0.2, t + 0.255);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  click.connect(cg);
  cg.connect(master);
  click.start(t + 0.25);
  click.stop(t + 0.35);
}

// 4. Rotation-synced Spin Tick
let lastTickAngle = 0;

export function resetTickTracking() {
  lastTickAngle = 0;
}

export function playTickIfPassed(rotation) {
  if (isMuted) return;
  const r = ((rotation % 360) + 360) % 360;
  const lastR = ((lastTickAngle % 360) + 360) % 360;
  const step = 20;
  const currStep = Math.floor(r / step);
  const prevStep = Math.floor(lastR / step);

  if (currStep !== prevStep) {
    lastTickAngle = rotation;
    const { ctx, master } = getAudioContext();
    const t = now();

    // Wooden mechanical tick — short, warm, resonant
    const osc = makeOsc('triangle', 600 + Math.random() * 80, 0);
    const filter = makeFilter('bandpass', 800, 2.5);
    const g = makeGain(0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.045);

    // Body thud for wood resonance
    const thud = makeOsc('sine', 120, 0);
    const tg = makeGain(0);
    tg.gain.setValueAtTime(0, t);
    tg.gain.linearRampToValueAtTime(0.12, t + 0.002);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    thud.connect(tg);
    tg.connect(master);
    thud.start(t);
    thud.stop(t + 0.04);
  }
}

// 5. Spin Land — tier-scaled impact thump + chord fanfare
export function playSpinLand(tier) {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // === Impact thump (all tiers, slightly louder for higher) ===
  const thumpVol = tier === 'Jackpot' ? 0.4 : tier === 'Bonus' ? 0.35 : tier === 'Tier 3' ? 0.3 : 0.25;
  const thumpOsc = makeOsc('sine', 60, 0);
  const thumpG = makeGain(0);
  thumpG.gain.setValueAtTime(0, t);
  thumpG.gain.linearRampToValueAtTime(thumpVol, t + 0.01);
  thumpG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  const thumpFilter = makeFilter('lowpass', 120, 1);
  thumpOsc.connect(thumpFilter);
  thumpFilter.connect(thumpG);
  thumpG.connect(master);
  thumpOsc.start(t);
  thumpOsc.stop(t + 0.2);

  // Sub-bass
  const sub = makeOsc('sine', 40, 0);
  const subG = makeGain(0);
  subG.gain.setValueAtTime(0, t);
  subG.gain.linearRampToValueAtTime(thumpVol * 0.7, t + 0.005);
  subG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  const subFilter = makeFilter('lowpass', 80, 1);
  sub.connect(subFilter);
  subFilter.connect(subG);
  subG.connect(master);
  sub.start(t);
  sub.stop(t + 0.15);

  // === Pre-chord arpeggio (T3+) ===
  const chordStart = t + 0.12;
  if (tier === 'Jackpot') {
    // Full ascending arpeggio over 300ms
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, i) => {
      const osc = makeOsc('triangle', freq, 0);
      const g = makeGain(0);
      g.gain.setValueAtTime(0, chordStart - 0.3 + i * 0.06);
      g.gain.linearRampToValueAtTime(0.15, chordStart - 0.3 + i * 0.06 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, chordStart - 0.3 + i * 0.06 + 0.08);
      osc.connect(g);
      g.connect(master);
      osc.start(chordStart - 0.3 + i * 0.06);
      osc.stop(chordStart - 0.3 + i * 0.06 + 0.1);
    });
  } else if (tier === 'Bonus') {
    // Upward shimmer sweep over 200ms
    const sweep = makeOsc('sine', 400, 0);
    const sg = makeGain(0);
    sg.gain.setValueAtTime(0, chordStart - 0.2);
    sg.gain.linearRampToValueAtTime(0.12, chordStart - 0.2 + 0.01);
    sg.gain.exponentialRampToValueAtTime(0.001, chordStart - 0.02);
    sweep.frequency.setValueAtTime(400, chordStart - 0.2);
    sweep.frequency.exponentialRampToValueAtTime(1800, chordStart - 0.02);
    sweep.connect(sg);
    sg.connect(master);
    sweep.start(chordStart - 0.2);
    sweep.stop(chordStart);
  } else if (tier === 'Tier 3') {
    // Fast rising arpeggio over 150ms
    [392.00, 493.88, 587.33, 739.99].forEach((freq, i) => {
      const osc = makeOsc('triangle', freq, 0);
      const g = makeGain(0);
      g.gain.setValueAtTime(0, chordStart - 0.15 + i * 0.035);
      g.gain.linearRampToValueAtTime(0.12, chordStart - 0.15 + i * 0.035 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, chordStart - 0.15 + i * 0.035 + 0.06);
      osc.connect(g);
      g.connect(master);
      osc.start(chordStart - 0.15 + i * 0.035);
      osc.stop(chordStart - 0.15 + i * 0.035 + 0.08);
    });
  }

  // === Main chord (tier-scaled) ===
  const chords = {
    'Tier 1': { freqs: [523.25, 659.25, 783.99], vol: 0.25, type: 'sine', decay: 0.4 },
    'Tier 2': { freqs: [587.33, 739.99, 880.00, 1108.73], vol: 0.30, type: 'sine', decay: 0.55 },
    'Tier 3': { freqs: [659.25, 830.61, 987.77, 1318.51], vol: 0.35, type: 'triangle', decay: 0.7 },
    'Bonus': { freqs: [783.99, 987.77, 1174.66, 1567.98], vol: 0.40, type: 'triangle', decay: 0.8 },
    'Jackpot': { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51], vol: 0.50, type: 'triangle', decay: 1.0 },
    '75%': { freqs: [587.33, 739.99, 880.00], vol: 0.28, type: 'sine', decay: 0.5 },
    '50%': { freqs: [587.33, 739.99, 880.00], vol: 0.28, type: 'sine', decay: 0.5 },
    '25%': { freqs: [587.33, 739.99, 880.00], vol: 0.28, type: 'sine', decay: 0.5 },
    'FREE': { freqs: [783.99, 987.77, 1174.66], vol: 0.32, type: 'sine', decay: 0.6 },
    'EXTRA': { freqs: [783.99, 987.77, 1174.66], vol: 0.32, type: 'sine', decay: 0.6 },
  };

  const c = chords[tier] || chords['Tier 1'];
  c.freqs.forEach((freq, i) => {
    const osc1 = makeOsc(c.type, freq, 5);
    const osc2 = makeOsc(c.type, freq, -5);
    const g = makeGain(0);
    g.gain.setValueAtTime(0, chordStart + i * 0.05);
    g.gain.linearRampToValueAtTime(c.vol, chordStart + i * 0.05 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, chordStart + i * 0.05 + c.decay);
    osc1.connect(g);
    osc2.connect(g);
    g.connect(master);
    osc1.start(chordStart + i * 0.05);
    osc2.start(chordStart + i * 0.05);
    osc1.stop(chordStart + i * 0.05 + c.decay + 0.5);
    osc2.stop(chordStart + i * 0.05 + c.decay + 0.5);

    // Jackpot: extra octave layer for richness
    if (tier === 'Jackpot') {
      const oct = makeOsc('sine', freq * 2, 3);
      const og = makeGain(0);
      og.gain.setValueAtTime(0, chordStart + i * 0.05);
      og.gain.linearRampToValueAtTime(c.vol * 0.3, chordStart + i * 0.05 + 0.03);
      og.gain.exponentialRampToValueAtTime(0.001, chordStart + i * 0.05 + c.decay * 0.8);
      oct.connect(og);
      og.connect(master);
      oct.start(chordStart + i * 0.05);
      oct.stop(chordStart + i * 0.05 + c.decay + 0.3);
    }
  });

  // === Post-chord effects ===
  if (tier === 'Jackpot') {
    // Echo chord at half volume, 400ms later
    setTimeout(() => {
      if (isMuted) return;
      const t2 = now() + chordStart;
      c.freqs.forEach((freq, i) => {
        const osc = makeOsc('sine', freq, 3);
        const g = makeGain(0);
        g.gain.setValueAtTime(0, t2 + i * 0.05);
        g.gain.linearRampToValueAtTime(c.vol * 0.35, t2 + i * 0.05 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + i * 0.05 + 0.4);
        osc.connect(g);
        g.connect(master);
        osc.start(t2 + i * 0.05);
        osc.stop(t2 + i * 0.05 + 0.6);
      });
    }, 400);
  } else if (tier === 'Bonus') {
    // Pitch wobble at end of sustain
    c.freqs.forEach((freq, i) => {
      const wobble = makeOsc('sine', freq, 0);
      const wg = makeGain(0);
      wg.gain.setValueAtTime(0, chordStart + i * 0.05 + c.decay * 0.6);
      wg.gain.linearRampToValueAtTime(c.vol * 0.2, chordStart + i * 0.05 + c.decay * 0.6 + 0.02);
      wg.gain.exponentialRampToValueAtTime(0.001, chordStart + i * 0.05 + c.decay + 0.2);
      wobble.frequency.setValueAtTime(freq, chordStart + i * 0.05 + c.decay * 0.6);
      wobble.frequency.setValueAtTime(freq * 1.03, chordStart + i * 0.05 + c.decay * 0.65);
      wobble.frequency.setValueAtTime(freq, chordStart + i * 0.05 + c.decay * 0.7);
      wobble.connect(wg);
      wg.connect(master);
      wobble.start(chordStart + i * 0.05 + c.decay * 0.6);
      wobble.stop(chordStart + i * 0.05 + c.decay + 0.3);
    });
  } else if (tier === 'Tier 3') {
    // Gentle vibrato tail
    c.freqs.forEach((freq, i) => {
      const vib = makeOsc('sine', freq, 0);
      const vg = makeGain(0);
      vg.gain.setValueAtTime(0, chordStart + i * 0.05 + c.decay * 0.7);
      vg.gain.linearRampToValueAtTime(c.vol * 0.15, chordStart + i * 0.05 + c.decay * 0.7 + 0.02);
      vg.gain.exponentialRampToValueAtTime(0.001, chordStart + i * 0.05 + c.decay + 0.2);
      vib.frequency.setValueAtTime(freq, chordStart + i * 0.05 + c.decay * 0.7);
      vib.frequency.linearRampToValueAtTime(freq * 1.01, chordStart + i * 0.05 + c.decay * 0.7 + 0.1);
      vib.frequency.linearRampToValueAtTime(freq, chordStart + i * 0.05 + c.decay + 0.15);
      vib.connect(vg);
      vg.connect(master);
      vib.start(chordStart + i * 0.05 + c.decay * 0.7);
      vib.stop(chordStart + i * 0.05 + c.decay + 0.25);
    });
  }
}

// 6. Cash In — weighty coin cascade with metallic ring
export function playCashIn() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();

  [0, 90, 170, 250, 340].forEach((delay, i) => {
    setTimeout(() => {
      if (isMuted) return;
      const t = now();

      // Coin thud
      const osc1 = makeOsc('sine', 500 + i * 150, 0);
      const g1 = makeGain(0);
      env(g1, t, 0.002, 0.03, 0.2, 0.06);
      osc1.connect(g1);
      g1.connect(master);
      osc1.start(t);
      osc1.stop(t + 0.2);

      // Metallic ring
      const osc2 = makeOsc('triangle', 2000 + i * 200, 2);
      const g2 = makeGain(0);
      env(g2, t + 0.01, 0.01, 0.04, 0.08, 0.04);
      osc2.connect(g2);
      g2.connect(master);
      osc2.start(t + 0.01);
      osc2.stop(t + 0.15);
    }, delay);
  });
}

// 7. Reward Won — tier-scaled euphoric fanfare
export function playRewardWon(tier) {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  const tierConfigs = {
    1: { freqs: [659.25, 783.99], vol: 0.15, sparkle: false, echo: false },
    2: { freqs: [659.25, 783.99, 1046.50], vol: 0.18, sparkle: false, echo: false },
    3: { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51], vol: 0.20, sparkle: true, echo: false },
    4: { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51], vol: 0.25, sparkle: true, echo: true },
  };

  const cfg = tierConfigs[tier] || tierConfigs[1];

  // Main arpeggio fanfare
  cfg.freqs.forEach((freq, i) => {
    [-7, 0, 7].forEach((detune) => {
      const osc = makeOsc('sine', freq, detune);
      const g = makeGain(0);
      const vol = detune === 0 ? cfg.vol : cfg.vol * 0.4;
      g.gain.setValueAtTime(0, t + i * 0.1);
      g.gain.linearRampToValueAtTime(vol, t + i * 0.1 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5 + (tier >= 3 ? 0.3 : 0));
      osc.connect(g);
      g.connect(master);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.8);
    });
  });

  // Sparkle overlay (Tier 3+)
  if (cfg.sparkle) {
    const spark = makeOsc('triangle', 2093.00, 0);
    const sg = makeGain(0);
    sg.gain.setValueAtTime(0, t + 0.3);
    sg.gain.linearRampToValueAtTime(0.1, t + 0.32);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    spark.connect(sg);
    sg.connect(master);
    spark.start(t + 0.3);
    spark.stop(t + 1.5);

    // Secondary sparkle higher
    const spark2 = makeOsc('triangle', 2793.00, 0);
    const sg2 = makeGain(0);
    sg2.gain.setValueAtTime(0, t + 0.5);
    sg2.gain.linearRampToValueAtTime(0.06, t + 0.52);
    sg2.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    spark2.connect(sg2);
    sg2.connect(master);
    spark2.start(t + 0.5);
    spark2.stop(t + 1.2);
  }

  // Echo reverb (Tier 4 / Jackpot)
  if (cfg.echo) {
    setTimeout(() => {
      if (isMuted) return;
      const t2 = now();
      cfg.freqs.slice(0, 3).forEach((freq, i) => {
        const osc = makeOsc('sine', freq, 3);
        const g = makeGain(0);
        g.gain.setValueAtTime(0, t2 + i * 0.08);
        g.gain.linearRampToValueAtTime(cfg.vol * 0.3, t2 + i * 0.08 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + i * 0.08 + 0.4);
        osc.connect(g);
        g.connect(master);
        osc.start(t2 + i * 0.08);
        osc.stop(t2 + i * 0.08 + 0.5);
      });
    }, 500);
  }
}

// 8. Bonus Timer Tick — soft urgent pulse
export function playTimerTick() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  const osc = makeOsc('sine', 660, 0);
  const g = makeGain(0);
  env(g, t, 0.005, 0.02, 0.1, 0.04);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.1);
}

// 9. UI Click — very soft subtle click
export function playClick() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  const osc = makeOsc('sine', 1500, 0);
  const g = makeGain(0);
  env(g, t, 0.001, 0.005, 0.06, 0.015);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.03);
}

// 10. Token Win — bright uplifting bell
export function playTokenWin() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // Bright bell (sine + triangle)
  const osc1 = makeOsc('sine', 1046.50, 0);
  const osc2 = makeOsc('triangle', 1046.50, 3);
  const g = makeGain(0);
  env(g, t, 0.02, 0.05, 0.25, 0.25);
  osc1.connect(g);
  osc2.connect(g);
  g.connect(master);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 0.5);
  osc2.stop(t + 0.5);

  // Upward sweep
  const sweep = makeOsc('sine', 1046.50, -2);
  const sg = makeGain(0);
  env(sg, t, 0.02, 0.05, 0.15, 0.25);
  sweep.frequency.exponentialRampToValueAtTime(1567.98, t + 0.2);
  sweep.connect(sg);
  sg.connect(master);
  sweep.start(t);
  sweep.stop(t + 0.5);
}

// 11. Token Miss — soft dull thud
export function playTokenMiss() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // Dull thud
  const osc = makeOsc('sine', 180, 0);
  const filter = makeFilter('lowpass', 300, 1);
  const g = makeGain(0);
  env(g, t, 0.005, 0.03, 0.2, 0.08);
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
  osc.connect(filter);
  filter.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.3);
}