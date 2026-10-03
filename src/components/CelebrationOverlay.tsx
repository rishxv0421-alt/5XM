import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CelebrationOverlayProps {
  status: 'WIN' | 'JACKPOT' | 'LOSS';
  period: string;
  number: number;
  prediction?: 'BIG' | 'SMALL';
  onClose: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  status,
  period,
  number,
  prediction,
  onClose,
}) => {
  const isJackpot = status === 'JACKPOT';
  const isWin = status === 'WIN';
  const isLoss = status === 'LOSS';
  const actualSize = number >= 5 ? 'BIG' : 'SMALL';

  useEffect(() => {
    if (isJackpot || isWin) {
      confetti({
        particleCount: isJackpot ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: isJackpot ? ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899'] : ['#06b6d4', '#10b981', '#ffffff'],
      });
    }

    const timer = setTimeout(() => {
      onClose();
    }, isJackpot ? 5000 : isWin ? 3500 : 3000);

    return () => clearTimeout(timer);
  }, [isJackpot, isWin, isLoss, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 text-center border-2 shadow-2xl overflow-hidden animate-scaleUp ${
          isJackpot
            ? 'bg-gradient-to-b from-amber-950 via-gray-950 to-amber-950 border-amber-400 shadow-amber-500/40'
            : isWin
            ? 'bg-gradient-to-b from-cyan-950 via-gray-950 to-blue-950 border-cyan-400 shadow-cyan-500/40'
            : 'bg-gradient-to-b from-rose-950 via-gray-950 to-slate-950 border-rose-500 shadow-rose-500/30'
        }`}
      >
        {/* Top Glow Ribbon */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent" />

        {/* Hero Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center shadow-2xl">
          {isJackpot ? (
            <div className="w-full h-full rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center animate-bounce">
              <Crown className="w-9 h-9 text-amber-400" />
            </div>
          ) : isWin ? (
            <div className="w-full h-full rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-cyan-400" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-rose-400" />
            </div>
          )}
        </div>

        {/* Ribbon Tag */}
        <span
          className={`text-[10px] font-orbitron font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${
            isJackpot
              ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
              : isWin
              ? 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
              : 'text-rose-300 border-rose-500/40 bg-rose-500/10'
          }`}
        >
          {isJackpot
            ? '👑 ELITE REWARD SIGNAL'
            : isWin
            ? '✦ VERIFIED LIVE SIGNAL'
            : '⚠ RESULT AUDITED'}
        </span>

        {/* Heading */}
        <h2
          className={`font-orbitron font-black text-2xl mt-1.5 ${
            isJackpot ? 'text-amber-400' : isWin ? 'text-cyan-300' : 'text-rose-400'
          }`}
        >
          {isJackpot ? 'JACKPOT HIT!' : isWin ? 'PREDICTION WIN!' : 'ROUND LOSS'}
        </h2>

        {/* Subtitle */}
        <p className="text-xs font-rajdhani text-slate-300 mt-1 mb-4">
          {isJackpot
            ? 'Exact target number matched the live WinGo outcome.'
            : isWin
            ? 'Predicted side verified in live round.'
            : 'The live result did not match this signal. Scanning next round...'}
        </p>

        {/* Metadata Grid */}
        <div className="mb-4 p-3 rounded-2xl bg-black/50 border border-slate-800 grid grid-cols-3 gap-2 text-xs font-code">
          <div className="text-left">
            <span className="text-[9px] text-slate-400 block font-orbitron">PERIOD</span>
            <strong className="text-white text-xs">{period}</strong>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block font-orbitron">TARGET</span>
            <strong
              className={`text-xs ${
                prediction === 'BIG' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {prediction || '—'}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block font-orbitron">ACTUAL</span>
            <strong
              className={`text-sm ${
                isJackpot ? 'text-amber-400 font-black' : isWin ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {number} ({actualSize})
            </strong>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
            isJackpot
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black shadow-lg shadow-amber-500/25'
              : isWin
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
          }`}
        >
          <span>CONTINUE TO DASHBOARD</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
