import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  Radio,
  Sliders,
  Share2,
  Volume2,
  RefreshCw,
  Cpu,
  Flame,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { WinGoSignal, PredictionHistoryItem } from '../types';
import { sounds } from '../utils/audio';

interface PredictorViewProps {
  currentPeriod: string;
  secondsLeft: number;
  currentSignal: WinGoSignal | null;
  history: PredictionHistoryItem[];
  onTriggerScan: () => void;
  isScanning: boolean;
  scanProgress: number;
  scanMessage: string;
  onOpenPatternDrawer: () => void;
  isPatternDrawerOpen: boolean;
}

export const PredictorView: React.FC<PredictorViewProps> = ({
  currentPeriod,
  secondsLeft,
  currentSignal,
  history,
  onTriggerScan,
  isScanning,
  scanProgress,
  scanMessage,
  onOpenPatternDrawer,
  isPatternDrawerOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedCountdown = `00:${String(secondsLeft).padStart(2, '0')}`;

  const handleCopy = async () => {
    if (!currentSignal) return;
    sounds.playClick();

    const text = [
      '🚨 RHXVM V10 ELITE SIGNAL DISPATCH 🚨',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `⏱️  PERIOD       ➜  ${currentPeriod}`,
      `🧭  PREDICTION   ➜  ${currentSignal.size}`,
      `🎲  TARGET NUMBERS ➜  ${currentSignal.numbers.join(' • ')}`,
      `📡  CONFIDENCE    ➜  ${currentSignal.confidence}% CALIBRATED`,
      `🎨  COLOR         ➜  ${currentSignal.color}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `🧠  ENGINE        ➜  RHXVM V10 QUANTUM AI`,
      `🔬  MODE          ➜  MARKOV • N-GRAM • STREAK`,
      `🌐  STATUS        ➜  LIVE / VERIFIED ✅`,
      '',
      '⚡ POWERED BY RHXVM V10 ON TOP 🔝 ⚡',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = () => {
    if (!currentSignal) return;
    sounds.playClick();
    const shareText = `RHXVM V10 ON TOP 🔝 | Period: ${currentPeriod} | Signal: ${currentSignal.size} | Targets: [${currentSignal.numbers.join(', ')}] | ${currentSignal.confidence}% Calibrated`;
    if (navigator.share) {
      navigator.share({ title: 'RHXVM V10 Live Signal', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBig = currentSignal?.size === 'BIG';

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-fadeIn">
      {/* Live Stream Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs font-code text-slate-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-bold">LIVE 1M WIN GO FEED</span>
        </div>
        <div className="flex items-center gap-1 text-cyan-400 font-bold">
          <Cpu className="w-3.5 h-3.5" />
          <span>V10 NEURAL SYNC</span>
        </div>
      </div>

      {/* Main Signal Display Card */}
      <div className="relative rounded-3xl glass-panel border border-cyan-500/30 p-5 sm:p-6 shadow-2xl shadow-cyan-500/15 overflow-hidden">
        {/* Animated Cyber Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Scanline Sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-pulse" />

        {/* Period & Countdown Row */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/20 text-xs sm:text-sm font-code">
          <div>
            <span className="text-[10px] text-slate-400 font-orbitron block">UPCOMING PERIOD</span>
            <strong className="text-white font-extrabold tracking-wider text-base sm:text-lg">
              {currentPeriod || 'CONNECTING...'}
            </strong>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-orbitron block">DRAW TIME</span>
            <span
              className={`font-orbitron font-black text-lg tracking-widest ${
                secondsLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-emerald-400'
              }`}
            >
              {formattedCountdown}
            </span>
          </div>
        </div>

        {/* Signal Body or Radar Scanning */}
        {isScanning ? (
          <div className="py-10 text-center space-y-4">
            {/* Animated Radar */}
            <div className="relative w-24 h-24 mx-auto rounded-full border-2 border-cyan-400/40 p-2 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-300/30 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="w-full h-full rounded-full bg-cyan-950/40 flex items-center justify-center">
                <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-cyan-300 via-transparent to-cyan-300 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>

            <div>
              <h3 className="font-orbitron font-extrabold text-lg text-cyan-300">
                {scanProgress}% · {scanMessage}
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani mt-1">
                Decoding Markov probability matrices and pattern streaks...
              </p>
            </div>
          </div>
        ) : currentSignal ? (
          <div className="py-5 text-center space-y-4">
            <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-slate-400 uppercase bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              ⚡ QUANTUM PREDICTION RESULT
            </span>

            {/* BIG / SMALL Hero Display */}
            <div className="flex justify-center">
              <div
                className={`inline-block px-8 py-3 rounded-2xl font-orbitron font-black text-4xl sm:text-5xl tracking-widest shadow-2xl transition-all ${
                  isBig
                    ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white shadow-rose-500/40 border-2 border-rose-400/60'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white shadow-emerald-500/40 border-2 border-emerald-400/60'
                }`}
              >
                {currentSignal.size}
              </div>
            </div>

            {/* Dual Target Numbers & Color */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="text-center">
                <span className="text-[10px] font-orbitron text-slate-400 block mb-1">
                  TARGET NO 1
                </span>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300 text-white font-orbitron font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  {currentSignal.numbers[0]}
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-orbitron text-slate-400 block mb-1">
                  TARGET NO 2
                </span>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 border border-fuchsia-300 text-white font-orbitron font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  {currentSignal.numbers[1]}
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-orbitron text-slate-400 block mb-1">
                  COLOR BIAS
                </span>
                <div
                  className={`w-14 h-14 rounded-2xl border text-white font-orbitron font-bold text-xs flex items-center justify-center shadow-lg ${
                    currentSignal.color === 'GREEN'
                      ? 'bg-emerald-600 border-emerald-400 shadow-emerald-500/30'
                      : currentSignal.color === 'RED'
                      ? 'bg-rose-600 border-rose-400 shadow-rose-500/30'
                      : 'bg-purple-600 border-purple-400 shadow-purple-500/30'
                  }`}
                >
                  {currentSignal.color}
                </div>
              </div>
            </div>

            {/* Confidence Calibration Bar */}
            <div className="pt-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs font-code mb-1">
                <span className="text-slate-400">ALGORITHM ACCURACY:</span>
                <span className="text-cyan-400 font-bold">{currentSignal.confidence}% CALIBRATED</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${currentSignal.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-rajdhani">
            <p>Connecting to live WinGo servers...</p>
          </div>
        )}

        {/* Copy Prediction Button */}
        <button
          onClick={handleCopy}
          disabled={!currentSignal || isScanning}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-orbitron font-extrabold text-xs sm:text-sm tracking-wider shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '✓ COPIED ULTRA SIGNAL!' : '⚡ COPY ULTRA SIGNAL (TELEGRAM READY)'}</span>
        </button>
      </div>

      {/* 4-Button Cyber Command Deck */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            sounds.playClick();
            onTriggerScan();
          }}
          disabled={isScanning}
          className="p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white font-orbitron font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>SCAN NOW</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenPatternDrawer();
          }}
          className={`p-3 rounded-2xl border font-orbitron font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
            isPatternDrawerOpen
              ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>PATTERNS</span>
        </button>

        <button
          onClick={handleShare}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-orbitron font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>SHARE</span>
        </button>

        <button
          onClick={() => {
            if (currentSignal) {
              sounds.speak(`RHXVM V10 Signal is ${currentSignal.size}, numbers ${currentSignal.numbers.join(' and ')}`);
            }
          }}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-orbitron font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>VOICE</span>
        </button>
      </div>

      {/* Pattern Matrix Drawer Component */}
      {isPatternDrawerOpen && (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/40 shadow-xl shadow-purple-500/10 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-orbitron font-bold text-purple-300">
            <span>⌘ RHXVM V10 QUANTUM MATRIX</span>
            <span className="text-emerald-400">99.2% CALIBRATED</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-code">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span>
              <span>MARKOV 3-STAGE TRANSITION</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span>
              <span>STREAK INVERSION GUARD</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span>
              <span>EXPONENTIAL RECENCY WEIGHT</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <span>✓</span>
              <span>DUAL TARGET CALIBRATION</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Streak Mini Bar */}
      {history.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs font-code">
          <span className="text-slate-400 font-orbitron text-[10px] whitespace-nowrap">
            RECENT OUTCOMES:
          </span>
          <div className="flex items-center gap-1.5">
            {history.slice(0, 8).map(item => (
              <span
                key={item.id}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-orbitron font-extrabold ${
                  item.status === 'JACKPOT'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : item.status === 'WIN'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                }`}
              >
                {item.status === 'JACKPOT' ? '👑' : item.status === 'WIN' ? '✓' : '×'} {item.period.slice(-3)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
