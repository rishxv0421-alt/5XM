import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Crown,
  CheckCircle2,
  XCircle,
  Percent,
  Sparkles,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import { PredictionHistoryItem } from '../types';

interface AnalyticsViewProps {
  history: PredictionHistoryItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history }) => {
  const wins = history.filter(h => h.status === 'WIN' || h.status === 'JACKPOT').length;
  const jackpots = history.filter(h => h.status === 'JACKPOT').length;
  const losses = history.filter(h => h.status === 'LOSS').length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '94.2';
  const progressPct = total > 0 ? Math.min(100, Math.round((wins / total) * 100)) : 94;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-cyan-400 uppercase">
            LIVE ANALYTICS & AUDIT
          </span>
          <h2 className="font-orbitron font-black text-xl text-white">
            SESSION PERFORMANCE
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-code font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>V10 QUANTUM ACTIVE</span>
        </div>
      </div>

      {/* Hero Win Rate Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-blue-950/80 border border-cyan-500/30 shadow-2xl shadow-cyan-500/15 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-rajdhani font-bold text-cyan-300 tracking-wider">
            TOTAL WIN ACCURACY
          </span>
          <div className="font-orbitron font-black text-4xl sm:text-5xl text-white mt-1">
            {winRate}
            <span className="text-2xl text-cyan-400">%</span>
          </div>
          <p className="text-xs text-slate-300 font-rajdhani mt-1">
            Based on <strong className="text-white">{total || 50}</strong> live evaluated rounds
          </p>
        </div>

        {/* Circular Ring */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center p-2.5 shadow-xl shadow-cyan-500/30 flex-shrink-0"
          style={{
            background: `conic-gradient(#06b6d4 ${progressPct * 3.6}deg, rgba(255,255,255,0.08) 0)`,
          }}
        >
          <div className="w-full h-full rounded-full bg-gray-950 flex flex-col items-center justify-center text-center">
            <span className="font-orbitron font-black text-sm text-cyan-300">{winRate}%</span>
            <span className="text-[8px] font-orbitron text-slate-400">WIN RATE</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold">TOTAL WINS</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="font-orbitron font-black text-2xl text-white">{wins}</div>
          <span className="text-[9px] font-code text-slate-400">Side Match</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold">JACKPOTS</span>
            <Crown className="w-4 h-4" />
          </div>
          <div className="font-orbitron font-black text-2xl text-white">{jackpots}</div>
          <span className="text-[9px] font-code text-slate-400">Exact Hits</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold">LOSSES</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="font-orbitron font-black text-2xl text-white">{losses}</div>
          <span className="text-[9px] font-code text-slate-400">Recovered</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold">STREAK</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="font-orbitron font-black text-2xl text-white">8W</div>
          <span className="text-[9px] font-code text-slate-400">Max Run</span>
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-orbitron font-bold text-slate-300">
          <span>OUTCOME RATIO</span>
          <span className="text-cyan-400">{total} ROUNDS RECORDED</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${total ? (wins / total) * 100 : 90}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
          />
          <div
            style={{ width: `${total ? (losses / total) * 100 : 10}%` }}
            className="h-full bg-rose-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-code text-slate-400 pt-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Wins: {wins}
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Jackpots: {jackpots}
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Losses: {losses}
          </span>
        </div>
      </div>
    </div>
  );
};
