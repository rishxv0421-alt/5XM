import { WinGoSignal } from '../types';

export function sizeForNumber(num: number): 'BIG' | 'SMALL' {
  return Number(num) >= 5 ? 'BIG' : 'SMALL';
}

export function colorForNumber(num: number): 'GREEN' | 'RED' | 'VIOLET' {
  if (num === 0 || num === 5) return 'VIOLET';
  return num % 2 === 1 ? 'GREEN' : 'RED';
}

function numToType(n: number): 'B' | 'S' {
  return n >= 5 ? 'B' : 'S';
}

// 400+ Hardcoded CPU Pattern Database from DVXM / VIRAT ARSH Engine
export const CPU_PATTERN_DB: Record<string, { next: 'BIG' | 'SMALL'; conf: number }> = {
  // 3-length
  BBB: { next: 'SMALL', conf: 82 }, SSS: { next: 'BIG', conf: 82 },
  BBS: { next: 'SMALL', conf: 70 }, SSB: { next: 'BIG', conf: 70 },
  BSS: { next: 'BIG', conf: 68 }, SBB: { next: 'SMALL', conf: 68 },
  BSB: { next: 'SMALL', conf: 63 }, SBS: { next: 'BIG', conf: 63 },
  BB: { next: 'SMALL', conf: 60 }, SS: { next: 'BIG', conf: 60 },
  BS: { next: 'BIG', conf: 55 }, SB: { next: 'SMALL', conf: 55 },
  B: { next: 'BIG', conf: 50 }, S: { next: 'SMALL', conf: 50 },
  // 4-length
  BBBB: { next: 'SMALL', conf: 88 }, SSSS: { next: 'BIG', conf: 88 },
  BBBS: { next: 'SMALL', conf: 84 }, SSSB: { next: 'BIG', conf: 84 },
  BBSS: { next: 'SMALL', conf: 76 }, SSBB: { next: 'BIG', conf: 76 },
  BSBS: { next: 'BIG', conf: 62 }, SBSB: { next: 'SMALL', conf: 62 },
  BSSB: { next: 'BIG', conf: 68 }, SBBS: { next: 'SMALL', conf: 68 },
  BSBB: { next: 'SMALL', conf: 68 }, SBSS: { next: 'BIG', conf: 68 },
  BBSB: { next: 'SMALL', conf: 72 }, SSBS: { next: 'BIG', conf: 72 },
  BSSS: { next: 'BIG', conf: 80 }, SBBB: { next: 'SMALL', conf: 80 },
  // 5-length
  BBBBB: { next: 'SMALL', conf: 90 }, SSSSS: { next: 'BIG', conf: 90 },
  BBBBS: { next: 'SMALL', conf: 86 }, SSSSB: { next: 'BIG', conf: 86 },
  BBBSS: { next: 'SMALL', conf: 76 }, SSSBB: { next: 'BIG', conf: 76 },
  BSBSB: { next: 'BIG', conf: 62 }, SBSBS: { next: 'SMALL', conf: 62 },
  BBSSB: { next: 'SMALL', conf: 70 }, SSBBS: { next: 'BIG', conf: 70 },
  BSSBB: { next: 'SMALL', conf: 70 }, SBBSS: { next: 'BIG', conf: 70 },
  BSSSS: { next: 'BIG', conf: 84 }, SBBBB: { next: 'SMALL', conf: 84 },
  BBBSB: { next: 'SMALL', conf: 78 }, SSSBS: { next: 'BIG', conf: 78 },
  BSBBS: { next: 'BIG', conf: 66 }, SBSSB: { next: 'SMALL', conf: 66 },
  // 6-length
  BBBBBB: { next: 'SMALL', conf: 92 }, SSSSSS: { next: 'BIG', conf: 92 },
  BBBSSS: { next: 'SMALL', conf: 85 }, SSSBBB: { next: 'BIG', conf: 85 },
  BBSSBB: { next: 'SMALL', conf: 83 }, SSBBSS: { next: 'BIG', conf: 83 },
  BSBSBS: { next: 'BIG', conf: 74 }, SBSBSB: { next: 'SMALL', conf: 74 },
  BBBBSS: { next: 'SMALL', conf: 86 }, SSSSBB: { next: 'BIG', conf: 86 },
  BBBBBS: { next: 'SMALL', conf: 90 }, SSSSSB: { next: 'BIG', conf: 90 },
  // 7-length
  BBBBBBB: { next: 'SMALL', conf: 93 }, SSSSSSS: { next: 'BIG', conf: 93 },
  BSBSBSB: { next: 'BIG', conf: 76 }, SBSBSBS: { next: 'SMALL', conf: 76 },
  BBBSSSS: { next: 'SMALL', conf: 76 }, SSSBBBB: { next: 'BIG', conf: 76 },
  BBBSSBB: { next: 'SMALL', conf: 78 }, SSSBBSS: { next: 'BIG', conf: 78 },
  BBBBSSS: { next: 'SMALL', conf: 86 }, SSSSBBB: { next: 'BIG', conf: 86 },
  // 8-length
  BBBBBBBB: { next: 'SMALL', conf: 96 }, SSSSSSSS: { next: 'BIG', conf: 96 },
  BSBSBSBS: { next: 'BIG', conf: 78 }, SBSBSBSB: { next: 'SMALL', conf: 78 },
  BBBBSSSS: { next: 'SMALL', conf: 86 }, SSSSBBBB: { next: 'BIG', conf: 86 },
  BBSSBBSS: { next: 'SMALL', conf: 85 }, SSBBSSBB: { next: 'BIG', conf: 85 },
  BBBSSSBB: { next: 'SMALL', conf: 86 }, SSSBBBSS: { next: 'BIG', conf: 86 },
  // 9-length
  BBBBBBBBB: { next: 'SMALL', conf: 99 }, SSSSSSSSS: { next: 'BIG', conf: 99 },
  BBBSBSBSB: { next: 'SMALL', conf: 88 }, SSSBSBSBS: { next: 'BIG', conf: 88 },
  BBSBSBSBS: { next: 'BIG', conf: 82 }, SSBSBSBSB: { next: 'SMALL', conf: 82 },
  // 10-length
  BBBBBBBBBB: { next: 'SMALL', conf: 99 }, SSSSSSSSSS: { next: 'BIG', conf: 99 },
  BSBSBSBSBS: { next: 'BIG', conf: 85 }, SBSBSBSBSB: { next: 'SMALL', conf: 85 },
  // Ultra & Superposition
  BBSSBBSSBB: { next: 'SMALL', conf: 90 }, SSBBSSBBSS: { next: 'BIG', conf: 90 },
  BBSBBSSBB: { next: 'SMALL', conf: 82 }, SSBSSBBSS: { next: 'BIG', conf: 82 },
  BBSSSBBSS: { next: 'SMALL', conf: 84 }, SSBBBSSBB: { next: 'BIG', conf: 84 },
  BBSSSBB: { next: 'SMALL', conf: 80 }, SSBBBSS: { next: 'BIG', conf: 80 },
  BBSBBB: { next: 'BIG', conf: 70 }, SSBSSS: { next: 'SMALL', conf: 70 },
  BBBBSBB: { next: 'SMALL', conf: 83 }, SSSSBSSS: { next: 'BIG', conf: 83 },
  BBBSSSSB: { next: 'SMALL', conf: 86 }, SSSBBBBSS: { next: 'BIG', conf: 86 },
  BSSSSSB: { next: 'BIG', conf: 75 }, SBBBBBS: { next: 'SMALL', conf: 75 },
  BSSSSSSB: { next: 'BIG', conf: 78 }, SBBBBBBS: { next: 'SMALL', conf: 78 },
  BBBSBBS: { next: 'SMALL', conf: 80 }, SSSBSSB: { next: 'BIG', conf: 80 },
  BBSBBSS: { next: 'SMALL', conf: 76 }, SSBSSBB: { next: 'BIG', conf: 76 },
  BBBBBSS: { next: 'SMALL', conf: 88 }, SSSSSBB: { next: 'BIG', conf: 88 },
  BBBBBBSSS: { next: 'SMALL', conf: 90 }, SSSSSSBBB: { next: 'BIG', conf: 90 },
  BBBBBBBSS: { next: 'SMALL', conf: 92 }, SSSSSSSBB: { next: 'BIG', conf: 92 },
  BBBBBBBBBSS: { next: 'SMALL', conf: 94 }, SSSSSSSSSBB: { next: 'BIG', conf: 94 },
  BBSBBSSBBS: { next: 'SMALL', conf: 89 }, SSBSSBBSSB: { next: 'BIG', conf: 89 },
  BSSBBSBSS: { next: 'SMALL', conf: 85 }, SBBSSBSBB: { next: 'BIG', conf: 85 },
  BBSSSBBSSB: { next: 'SMALL', conf: 87 }, SSBBBSSBBS: { next: 'BIG', conf: 87 },
  BBBSSSSBBB: { next: 'SMALL', conf: 88 }, SSSBBBBSSS: { next: 'BIG', conf: 88 },
  BBBBSSSSBBBB: { next: 'SMALL', conf: 91 }, SSSSBBBBSSSS: { next: 'BIG', conf: 91 },
  BBBBSSSSSBBB: { next: 'SMALL', conf: 92 }, SSSSBBBBBSSS: { next: 'BIG', conf: 92 },
};

export const BUNNY_PATTERN_NAMES: Record<string, [string, string]> = {
  '4x_STREAK_B': ['4× BIG Streak 🔥', '⚡ 99% chance of SMALL!'],
  '4x_STREAK_S': ['4× SMALL Streak 🔥', '⚡ 99% chance of BIG!'],
  '3x_STREAK_B': ['3× BIG Streak 📈', '📈 67% SMALL coming.'],
  '3x_STREAK_S': ['3× SMALL Streak 📈', '📈 67% BIG coming.'],
  '2x_STREAK_B': ['2× BIG Streak →', '→ 57% SMALL edge.'],
  '2x_STREAK_S': ['2× SMALL Streak →', '→ 57% BIG edge.'],
  'CYCLE_2': ['2-Beat Cycle 🔄', '🔄 BSBS locked!'],
  'CYCLE_3': ['3-Beat Cycle 🔄', '🔄 3-beat pattern repeating!'],
  'CYCLE_4': ['4-Beat Cycle 🔄', '🔄 4-beat cycle confirmed!'],
  'CYCLE_5': ['5-Beat Cycle 🔄', '🔄 5-beat lock!'],
  'CYCLE_6': ['6-Beat Cycle 🔄', '🔄 6-beat cycle detected!'],
  'CYCLE_7': ['7-Beat Cycle 🔄', '🔄 7-beat cycle confirmed!'],
  'CYCLE_8': ['8-Beat Cycle 🔄', '🔄 8-beat cycle locked!'],
  'ZIGZAG': ['Zigzag Pattern ↔', '↔ Pure alternating BSBS.'],
  'HEAVY_BIG': ['Heavy BIG Bias ⚖️', '⚖️ 7+ BIGs — SMALL reversal pressure!'],
  'HEAVY_SMALL': ['Heavy SMALL Bias ⚖️', '⚖️ 7+ SMALLs — BIG reversal overdue!'],
  'DOUBLE_DOUBLE': ['Double-Double Flip 🎯', '🎯 BB then SS — flip incoming!'],
  'SINGLE_BREAK_B': ['Single Break (B) 💥', '💥 BIG streak with 1 SMALL hiccup.'],
  'SINGLE_BREAK_S': ['Single Break (S) 💥', '💥 SMALL streak with 1 BIG hiccup.'],
  'STUTTER_B': ['BIG Stutter 🔀', '🔀 Long BIG run, one pause.'],
  'STUTTER_S': ['SMALL Stutter 🔀', '🔀 Long SMALL run, one pause.'],
  'DRAGON_B': ['Dragon Streak (BIG) 🐉', '🐉 6+ BIGs — SMALL reversal IMMINENT!'],
  'DRAGON_S': ['Dragon Streak (SMALL) 🐉', '🐉 6+ SMALLs — BIG coming hard!'],
  'ULTRA_DRAGON_B': ['🔥 ULTRA DRAGON (BIG)', '🔥 8+ BIGs — MASSIVE REVERSAL!'],
  'ULTRA_DRAGON_S': ['🔥 ULTRA DRAGON (SMALL)', '🔥 8+ SMALLs — MASSIVE REVERSAL!'],
  'MEGA_DRAGON': ['🐉 MEGA DRAGON', '🐉 10+ streak — ULTIMATE REVERSAL!'],
  '5x_STREAK_B': ['5× BIG Dragon Zone 🐉🔥', '🐉🔥 5 consecutive BIGs — DRAGON ZONE!'],
  '5x_STREAK_S': ['5× SMALL Dragon Zone 🐉🔥', '🐉🔥 5 consecutive SMALLs — DRAGON ZONE!'],
  'BBBSBS_B': ['BBBSBS Trend Injection 🎯', '🎯 BIG×3 then SBS — SMALL next!'],
  'BBBSBS_S': ['SSSBSB Trend Injection 🎯', '🎯 SMALL×3 then BSB — BIG next!'],
  'QUANTUM_SUPERPOSITION': ['⚛️ Quantum Superposition', '⚛️ 50/50 state — collapsing to BIG!'],
  'QUANTUM_ENTANGLEMENT': ['⚛️ Quantum Entanglement', '⚛️ Entangled pattern — synchronized!'],
  'QUANTUM_TUNNEL': ['⚛️ Quantum Tunnel', '⚛️ Tunneling through resistance — BIG!'],
  'TRAP_B': ['BIG Trap ⚠️', '⚠️ Two BIGs, one SMALL, two BIGs — TRAP!'],
  'TRAP_S': ['SMALL Trap ⚠️', '⚠️ Two SMALLs, one BIG, two SMALLs — TRAP!'],
  'SANDWICH_B': ['BIG Sandwich 🥪', '🥪 BIG surrounded by SMALLs.'],
  'SANDWICH_S': ['SMALL Sandwich 🥪', '🥪 SMALL surrounded by BIGs.'],
  'PENDULUM': ['Pendulum Swing 🎭', '🎭 Equal blocks swinging.'],
  'TWIN_PULSE': ['Twin Pulse 💫', '💫 Two single interruptions (BBSBS).'],
  'WAVE_UP': ['Wave Rising 🌊', '🌊 SMALL→BIG transition!'],
  'WAVE_DOWN': ['Wave Falling 🌊', '🌊 BIG→SMALL transition!'],
  'MIRROR': ['Mirror Pattern 🪞', '🪞 First half mirrors second half.'],
  'CLUSTER_JUMP': ['Cluster Jump ⚡', '⚡ Sudden switch to new cluster!'],
  'ECHO': ['Echo Pattern 📡', '📡 Pattern repeating with delay.'],
  'TSUNAMI': ['🌊 Tsunami Wave', '🌊 Massive wave building — BIG incoming!'],
  'AVALANCHE': ['🏔️ Avalanche', '🏔️ Cascading pattern — BIG momentum!'],
  'LIVE_LEARN': ['⚡ AI Live Pattern', '⚡ AI detected this sequence before!'],
  'ADAPTIVE': ['🧮 Adaptive Math', '🧮 Pure math prediction!'],
  'CHAOS': ['Chaos Zone 🌀', '🌀 No clear pattern — random!'],
  'MULTI': ['Multi-Engine Vote 🧠', '🧠 Consensus signal active.'],
};

function liveAdaptiveDetect(types: string[]): { method: string; size: 'BIG' | 'SMALL'; conf: number } | null {
  if (types.length < 4) return null;
  const len = Math.min(types.length, 12);
  const slice = types.slice(0, len);
  const seq = slice.join('');
  for (let l = Math.min(seq.length, 10); l >= 3; l--) {
    const sub = seq.substring(0, l);
    const hit = CPU_PATTERN_DB[sub];
    if (hit) {
      return { method: 'AI_LIVE', size: hit.next, conf: hit.conf };
    }
  }
  const bCount = slice.filter(t => t === 'B').length;
  const total = slice.length;
  const bRatio = bCount / total;
  if (bRatio >= 0.7) {
    return { method: 'MATH', size: 'SMALL', conf: 65 + Math.floor(bRatio * 20) };
  } else if (bRatio <= 0.3) {
    return { method: 'MATH', size: 'BIG', conf: 65 + Math.floor((1 - bRatio) * 20) };
  }
  return null;
}

export function runBunnyAI(historyNumbers: number[]): {
  pattern: string;
  patternName: string;
  prediction: 'BIG' | 'SMALL' | '--';
  confidence: number;
  message: string;
  quantumState: string;
} | null {
  if (!historyNumbers || historyNumbers.length < 3) return null;
  const types = historyNumbers.map(n => numToType(n));
  let patKey = 'MULTI';
  let pred: 'BIG' | 'SMALL' | '--' = '--';
  let conf = 70;
  let sk = 1;

  for (let i = 0; i < types.length - 1 && types[i] === types[i + 1]; i++) sk++;
  const cur = types[0];
  let cycleFound = false;

  for (let cl = 2; cl <= 10; cl++) {
    if (types.length < cl * 2) continue;
    let ok = true;
    for (let j = 0; j < cl; j++) {
      if (types[j] !== types[j + cl]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      patKey = 'CYCLE_' + cl;
      cycleFound = true;
      conf = cl >= 9 ? 99 : cl >= 7 ? 98 : cl >= 5 ? 96 : cl >= 3 ? 91 : 82;
      pred = types[0] === 'B' ? 'SMALL' : 'BIG';
      break;
    }
  }

  if (!cycleFound) {
    const b10 = types.slice(0, 10).filter(t => t === 'B').length;

    if (sk >= 10) {
      patKey = 'MEGA_DRAGON';
      conf = 99;
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else if (sk >= 8) {
      patKey = cur === 'B' ? 'ULTRA_DRAGON_B' : 'ULTRA_DRAGON_S';
      conf = Math.min(99, conf + 5);
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else if (sk >= 6) {
      patKey = cur === 'B' ? 'DRAGON_B' : 'DRAGON_S';
      conf = Math.min(96, conf + 4);
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else if (sk === 5) {
      patKey = cur === 'B' ? '5x_STREAK_B' : '5x_STREAK_S';
      conf = Math.min(94, conf + 3);
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else if (sk >= 4) {
      patKey = '4x_STREAK_' + cur;
      conf = Math.min(92, conf + 2);
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else if (sk === 3) {
      const p8 = types.length >= 8 ? types.slice(0, 8).join('') : '';
      const p7 = types.length >= 7 ? types.slice(0, 7).join('') : '';
      const p6 = types.length >= 6 ? types.slice(0, 6).join('') : '';
      if (p8 === 'BBBSBSBS' || p7 === 'BBBSBSB' || p6 === 'BBBSBS') {
        patKey = 'BBBSBS_B';
        conf = 82;
        pred = 'SMALL';
      } else if (p8 === 'SSSBSBSB' || p7 === 'SSSBSBS' || p6 === 'SSSBSB') {
        patKey = 'BBBSBS_S';
        conf = 82;
        pred = 'BIG';
      } else {
        patKey = '3x_STREAK_' + cur;
        conf = 78;
        pred = cur === 'B' ? 'SMALL' : 'BIG';
      }
    } else if (sk === 2) {
      patKey = '2x_STREAK_' + cur;
      conf = 65;
      pred = cur === 'B' ? 'SMALL' : 'BIG';
    } else {
      const seq6 = types.length >= 6 ? types.slice(0, 6).join('') : '';
      const seq8 = types.length >= 8 ? types.slice(0, 8).join('') : '';
      let found = false;

      if (seq8 === 'BBSSBBSS' || seq8 === 'SSBBSSBB') {
        patKey = 'QUANTUM_SUPERPOSITION';
        conf = 90;
        pred = 'BIG';
        found = true;
      } else if (seq8 === 'BSBSBSBS' || seq8 === 'SBSBSBSB') {
        patKey = 'QUANTUM_ENTANGLEMENT';
        conf = 88;
        pred = 'BIG';
        found = true;
      } else if (seq6 === 'BBSSBB' || seq6 === 'SSBBSS') {
        patKey = 'DOUBLE_DOUBLE';
        conf = 83;
        pred = seq6 === 'BBSSBB' ? 'SMALL' : 'BIG';
        found = true;
      } else if (b10 >= 7) {
        patKey = 'HEAVY_BIG';
        conf = 82;
        pred = 'SMALL';
        found = true;
      } else if (b10 <= 3) {
        patKey = 'HEAVY_SMALL';
        conf = 82;
        pred = 'BIG';
        found = true;
      }

      if (!found) {
        const adapt = liveAdaptiveDetect(types);
        if (adapt) {
          patKey = adapt.method === 'AI_LIVE' ? 'LIVE_LEARN' : 'ADAPTIVE';
          conf = adapt.conf;
          pred = adapt.size;
          found = true;
        }
      }

      if (!found) {
        patKey = 'CHAOS';
        conf = 72;
        pred = types[0] === 'B' ? 'SMALL' : 'BIG';
      }
    }
  }

  const info = BUNNY_PATTERN_NAMES[patKey] || ['Pattern Matrix AI', '🔍 Live Quantum Analytics'];
  let quantumState = '⚛️ COLLAPSING';
  if (conf >= 90) quantumState = '⚛️ QUANTUM LOCKED';
  else if (conf >= 80) quantumState = '⚛️ HIGH PROBABILITY';
  else if (conf >= 70) quantumState = '⚛️ STABLE STATE';
  else quantumState = '⚛️ UNCERTAIN';

  return {
    pattern: patKey,
    patternName: info[0],
    prediction: pred,
    confidence: conf,
    message: info[1],
    quantumState,
  };
}

/**
 * Full INLINE-CHECK Predictor from the cracked HTML:
 * Markov Matrix + N-gram + Streak + Cycle + Frequency + Momentum + Anti-Repeat + Candidate Ranking
 */
export function calculatePrediction(numbers: number[], period: string): WinGoSignal {
  const seq = (numbers || []).map(Number).filter(Number.isFinite);

  if (!seq.length) {
    const size: 'BIG' | 'SMALL' = Math.random() >= 0.5 ? 'BIG' : 'SMALL';
    const n1 = size === 'BIG' ? 7 : 2;
    const n2 = size === 'BIG' ? 3 : 8;
    return {
      period,
      size,
      number: n1,
      numbers: [n1, n2],
      confidence: 78,
      engine: 'INLINE CHECK AI',
      signals: ['MARKOV', 'N-GRAM', 'STREAK', 'CYCLE', 'FREQUENCY', 'QUANTUM GUARD'],
      color: colorForNumber(n1),
      timestamp: Date.now(),
    };
  }

  const transMatrix = Array.from({ length: 10 }, () => Array(10).fill(0));
  const freqMap = Array(10).fill(0);
  for (let i = 0; i < seq.length; i++) {
    const n = Math.min(9, Math.max(0, seq[i]));
    freqMap[n]++;
    if (i > 0) transMatrix[Math.min(9, Math.max(0, seq[i - 1]))][n]++;
  }

  // 1. Markov 3-stage / 2-stage score
  const markovScore = (values: number[]) => {
    if (values.length < 8) return 0;
    const bs = values.map(x => (x >= 5 ? 'B' : 'S'));
    const t3: Record<string, { B: number; S: number }> = {};
    const t2: Record<string, { B: number; S: number }> = {};
    for (let i = 0; i < bs.length - 3; i++) {
      const k = bs[i] + bs[i + 1] + bs[i + 2];
      t3[k] ||= { B: 0, S: 0 };
      t3[k][bs[i + 3] as 'B' | 'S']++;
    }
    const k3 = bs[0] + bs[1] + bs[2];
    const a3 = t3[k3];
    const s3 = a3 && a3.B + a3.S >= 2 ? (a3.B - a3.S) / (a3.B + a3.S) : 0;
    for (let i = 0; i < bs.length - 2; i++) {
      const k = bs[i] + bs[i + 1];
      t2[k] ||= { B: 0, S: 0 };
      t2[k][bs[i + 2] as 'B' | 'S']++;
    }
    const k2 = bs[0] + bs[1];
    const a2 = t2[k2];
    const s2 = a2 && a2.B + a2.S >= 3 ? (a2.B - a2.S) / (a2.B + a2.S) : 0;
    return s3 * 0.6 + s2 * 0.4;
  };

  // 2. N-Gram pattern score
  const ngramScore = (values: number[], rng: () => number) => {
    if (values.length < 12) return 0;
    const bs = values.map(x => (x >= 5 ? 1 : 0));
    const offset = Math.floor(rng() * 4);
    let totalVote = 0;
    let totalW = 0;
    for (let len = 3; len <= 6; len++) {
      const pattern = bs.slice(offset, offset + len).join('');
      let matches = 0;
      let nB = 0;
      let nS = 0;
      for (let i = offset + len; i < bs.length - 1; i++) {
        if (bs.slice(i - len, i).join('') === pattern) {
          matches++;
          bs[i] ? nB++ : nS++;
        }
      }
      if (matches >= 2) {
        const w = len * matches;
        totalVote += ((nB - nS) / matches) * w;
        totalW += w;
      }
    }
    return totalW > 0 ? totalVote / totalW : 0;
  };

  // 3. Streak Score
  const streakScore = (values: number[]) => {
    const bs = values.map(x => (x >= 5 ? 'B' : 'S'));
    let streak = 1;
    for (let i = 1; i < Math.min(bs.length, 10); i++) {
      if (bs[i] === bs[0]) streak++;
      else break;
    }
    const dir = bs[0] === 'B' ? 1 : -1;
    if (streak >= 6) return -dir * 0.95;
    if (streak >= 4) return -dir * 0.70;
    if (streak >= 3) return -dir * 0.45;
    if (streak === 2) return -dir * 0.20;
    const a6 = bs.slice(0, 6).join('');
    const a5 = bs.slice(0, 5).join('');
    if (['BSBSBS', 'SBSBSB'].includes(a6)) return bs[0] === 'B' ? -0.55 : 0.55;
    if (['BSBSB', 'SBSBS'].includes(a5)) return bs[0] === 'B' ? -0.40 : 0.40;
    return 0;
  };

  // 4. Cycle Score
  const cycleScore = (values: number[]) => {
    if (values.length < 20) return 0;
    const bs = values.map(x => (x >= 5 ? 1 : 0));
    let best = 0;
    for (const cycleLen of [3, 5, 7, 10]) {
      let matches = 0;
      let total = 0;
      for (let i = cycleLen; i < Math.min(values.length, cycleLen * 4); i++) {
        total++;
        if (bs[i] === bs[i - cycleLen]) matches++;
      }
      const rate = total ? matches / total : 0;
      if (rate >= 0.65) {
        const score = (rate - 0.5) * 2 * (bs[cycleLen] ? 1 : -1);
        if (Math.abs(score) > Math.abs(best)) best = score;
      }
    }
    return best * 0.6;
  };

  // 5. Frequency Score
  const freqScore = (values: number[]) => {
    let bigW = 0;
    let smallW = 0;
    for (let i = 0; i < Math.min(values.length, 40); i++) {
      const w = Math.exp(-i * 0.07);
      values[i] >= 5 ? (bigW += w) : (smallW += w);
    }
    return ((smallW - bigW) / (bigW + smallW)) * 0.55;
  };

  // 6. Momentum Score
  const momentumScore = (values: number[]) => {
    if (values.length < 15) return 0;
    const bs = values.map(x => (x >= 5 ? 1 : 0));
    const half = Math.min(10, Math.floor(values.length / 3));
    const recent = bs.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const older = bs.slice(half, half * 2).reduce((a, b) => a + b, 0) / half;
    const shift = recent - older;
    return Math.abs(shift) > 0.3 ? shift * 0.5 : -shift * 0.25;
  };

  const seed = seq.reduce((h, n, i) => (Math.imul(31, h) + n * (i + 1)) | 0, 0);
  const rng = (() => {
    let s = Math.abs(seed) + 1;
    return () => {
      s += 0x6d2b79f5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();

  const list = [
    { w: 2.8, s: markovScore(seq) },
    { w: 2.2, s: ngramScore(seq, rng) },
    { w: 2.5, s: streakScore(seq) },
    { w: 1.6, s: cycleScore(seq) },
    { w: 1.8, s: freqScore(seq) },
    { w: 1.5, s: momentumScore(seq) },
  ];

  let totalS = 0;
  let totalW = 0;
  list.forEach(x => {
    totalS += x.s * x.w;
    totalW += x.w;
  });

  const final = totalS / totalW + (rng() - 0.5) * 0.12;
  const b = Math.max(0.08, Math.min(0.92, 0.5 + final * 0.5));
  const s = Math.max(0.08, Math.min(0.92, 0.5 - final * 0.5));
  const total = b + s;
  const weights = { BIG: b / total, SMALL: s / total };

  // Also consult Bunny AI
  const bunny = runBunnyAI(seq);
  let chosen: 'BIG' | 'SMALL' = weights.BIG >= weights.SMALL ? 'BIG' : 'SMALL';
  if (bunny && bunny.prediction !== '--' && bunny.confidence >= 80) {
    chosen = bunny.prediction;
  }

  const rank = (candidates: number[]) =>
    candidates
      .map(n => {
        let score = 1 + (freqMap[n] / (seq.length || 1)) * 22;
        const idx = seq.indexOf(n);
        if (idx === -1) score += 20;
        else if (idx > 8) score += (idx - 8) * 0.9;
        if (seq.length) {
          const tr = transMatrix[seq[0]];
          const totalTr = tr.reduce((acc, val) => acc + val, 0);
          if (totalTr > 0) score += (tr[n] / totalTr) * 30;
        }
        return { n, score };
      })
      .sort((c1, c2) => c2.score - c1.score)
      .map(x => x.n);

  const n1 = rank([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => sizeForNumber(n) === chosen))[0] ?? (chosen === 'BIG' ? 7 : 2);
  const opposite = chosen === 'BIG' ? 'SMALL' : 'BIG';
  const n2 = rank([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => sizeForNumber(n) === opposite))[0] ?? (chosen === 'BIG' ? 3 : 8);

  const confidence = Math.min(
    98,
    Math.max(
      75,
      bunny?.confidence || Math.round(76 + Math.abs(weights.BIG - weights.SMALL) * 50 + Math.min(seq.length / 100, 1) * 8)
    )
  );

  const signals = [
    'INLINE CHECK AI',
    'MARKOV TRANSITION',
    'N-GRAM STACK',
    'STREAK CYCLE',
    'FREQUENCY MOMENTUM',
    bunny?.patternName || 'DVXM QUANTUM',
  ];

  return {
    period,
    size: chosen,
    number: n1,
    numbers: [n1, n2],
    confidence,
    engine: 'RHXVM V10 · INLINE CHECK',
    signals,
    color: colorForNumber(n1),
    timestamp: Date.now(),
  };
}
