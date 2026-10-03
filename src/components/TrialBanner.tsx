import React from 'react';
import { Timer, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TrialBannerProps {
  timeLeft: number; // seconds
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ timeLeft, onUpgrade }) => {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const isCritical = timeLeft < 60;

  return (
    <div
      className={`w-full py-2 px-4 transition-all border-b ${
        isCritical
          ? 'bg-rose-950/80 border-rose-500/50 text-rose-200 animate-pulse'
          : 'bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border-cyan-500/40 text-cyan-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-rajdhani font-bold">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Timer className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          )}
          <span>
            {isCritical ? '⚠️ 5-MIN TRIAL EXPIRING SOON:' : '⏳ 5-MIN FREE TRIAL ACTIVE:'}{' '}
            <strong className="font-code font-extrabold text-white text-sm sm:text-base tracking-widest ml-1 bg-black/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {formatted}
            </strong>
          </span>
          <span className="hidden md:inline text-slate-400 text-xs">
            (Strict 1-Device Limit · Join TG for Exclusive VIP Discounts)
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onUpgrade();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 font-orbitron font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-transform whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>BUY VIP PASS</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
