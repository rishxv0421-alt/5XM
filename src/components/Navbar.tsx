import React from 'react';
import { ShieldCheck, Volume2, VolumeX, Send, Sparkles, Key, Zap, Gamepad2, BarChart3, History, Crown } from 'lucide-react';
import { ActiveAccess } from '../types';
import { TELEGRAM_CHANNEL_URL } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  access: ActiveAccess | null;
  trialTimeLeft: number; // in seconds
  onOpenLicenseModal: () => void;
  onOpenTrialModal: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  access,
  trialTimeLeft,
  onOpenLicenseModal,
  onOpenTrialModal,
  isMuted,
  setIsMuted,
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
  };

  const formatTrialTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('predictor')}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-600 p-[1.5px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <span className="font-orbitron text-xs font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                R10
              </span>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-gray-950" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-white">
                RHXVM <span className="text-cyan-400">V10</span>
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] font-orbitron font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ON TOP 🔝
              </span>
            </div>
            <p className="text-[10px] font-code text-slate-400 leading-none">
              QUANTUM AI & VIP GATEWAY
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Official Telegram Link */}
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-all text-xs font-rajdhani font-bold hover:shadow-lg hover:shadow-blue-500/20"
            title="Join Official Telegram for Free Signals & Keys"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">JOIN TG</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-colors"
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Access Status Pill */}
          {access?.isPermanent ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-orbitron font-bold shadow-lg shadow-amber-500/20">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">LIFETIME VIP</span>
            </div>
          ) : access?.type === 'license' ? (
            <button
              onClick={onOpenLicenseModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-orbitron font-bold hover:bg-emerald-500/30 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIP ACTIVE</span>
            </button>
          ) : access?.type === 'trial' && trialTimeLeft > 0 ? (
            <button
              onClick={onOpenLicenseModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-code font-bold hover:bg-cyan-500/30 transition-all animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{formatTrialTime(trialTimeLeft)}</span>
              <span className="hidden sm:inline text-[10px] text-amber-400">UPGRADE</span>
            </button>
          ) : (
            <button
              onClick={onOpenLicenseModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-orbitron font-bold shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Key className="w-3.5 h-3.5" />
              <span>UNLOCK VIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pb-2 pt-1 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('predictor');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'predictor'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>PREDICTOR</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('injector');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'injector'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/60 shadow-lg shadow-fuchsia-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>HUD INJECTOR</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('pricing');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'pricing'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>QR LICENSES</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('analytics');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ANALYTICS</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('history');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/60 shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span>HISTORY</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('keygen');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold whitespace-nowrap transition-all ${
            activeTab === 'keygen'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-purple-400" />
          <span>KEY GEN</span>
        </button>
      </div>
    </header>
  );
};
