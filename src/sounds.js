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
    g.gain.linearRampToValueAtTime(0.2, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.045);

    // Subtle low thud for body (wood resonance)
    const thud = makeOsc('sine', 120, 0);
    const tg = makeGain(0);
    tg.gain.setValueAtTime(0, t);
    tg.gain.linearRampToValueAtTime(0.06, t + 0.002);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    thud.connect(tg);
    tg.connect(master);
    thud.start(t);
    thud.stop(t + 0.04);
  }
}

// 5. Spin Land — impact thump + rich chord with detuned warmth
export function playSpinLand(tier) {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  // Impact thump — low frequency punch before chord
  const thumpOsc = makeOsc('sine', 60, 0);
  const thumpG = makeGain(0);
  thumpG.gain.setValueAtTime(0, t);
  thumpG.gain.linearRampToValueAtTime(0.3, t + 0.01);
  thumpG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  const thumpFilter = makeFilter('lowpass', 120, 1);
  thumpOsc.connect(thumpFilter);
  thumpFilter.connect(thumpG);
  thumpG.connect(master);
  thumpOsc.start(t);
  thumpOsc.stop(t + 0.2);

  // Sub-bass thud layer
  const sub = makeOsc('sine', 40, 0);
  const subG = makeGain(0);
  subG.gain.setValueAtTime(0, t);
  subG.gain.linearRampToValueAtTime(0.2, t + 0.005);
  subG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  const subFilter = makeFilter('lowpass', 80, 1);
  sub.connect(subFilter);
  subFilter.connect(subG);
  subG.connect(master);
  sub.start(t);
  sub.stop(t + 0.15);

  const chords = {
    'Tier 1': [[523.25, 659.25, 783.99], 0.25],     // C major
    'Tier 2': [[587.33, 739.99, 880.00], 0.28],     // D major
    'Tier 3': [[659.25, 830.61, 987.77], 0.30],     // E major
    'Bonus': [[783.99, 987.77, 1174.66], 0.32],     // G major
    'Jackpot': [[523.25, 659.25, 783.99, 1046.50], 0.35], // C major + octave
    '75%': [[587.33, 739.99, 880.00], 0.28],
    '50%': [[587.33, 739.99, 880.00], 0.28],
    '25%': [[587.33, 739.99, 880.00], 0.28],
    'FREE': [[783.99, 987.77, 1174.66], 0.32],
    'EXTRA': [[783.99, 987.77, 1174.66], 0.32],
  };

  const [notes, baseVol] = chords[tier] || chords['Tier 1'];

  notes.forEach((freq, i) => {
    // Each note: 2 detuned sines for warmth
    const osc1 = makeOsc('sine', freq, 5);
    const osc2 = makeOsc('sine', freq, -5);
    const g = makeGain(0);
    env(g, t + i * 0.06, 0.03, 0.08, baseVol, 0.35);
    osc1.connect(g);
    osc2.connect(g);
    g.connect(master);
    osc1.start(t + i * 0.06);
    osc2.start(t + i * 0.06);
    osc1.stop(t + i * 0.06 + 1.2);
    osc2.stop(t + i * 0.06 + 1.2);
  });
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

// 7. Reward Won — euphoric shimmer fanfare
export function playRewardWon() {
  if (isMuted) return;
  const { ctx, master } = getAudioContext();
  const t = now();

  const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];

  baseFreqs.forEach((freq, i) => {
    // 3 detuned layers per note for shimmer
    [-7, 0, 7].forEach((detune) => {
      const osc = makeOsc('sine', freq, detune);
      const g = makeGain(0);
      const vol = detune === 0 ? 0.12 : 0.05;
      env(g, t + i * 0.1, 0.04, 0.1, vol, 0.5);
      osc.connect(g);
      g.connect(master);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 1.5);
    });
  });

  // Subtle sparkle overlay on last note
  const spark = makeOsc('triangle', 2093.00, 0);
  const sg = makeGain(0);
  env(sg, t + 0.4, 0.05, 0.15, 0.08, 0.4);
  spark.connect(sg);
  sg.connect(master);
  spark.start(t + 0.4);
  spark.stop(t + 1.5);
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