import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  ExternalLink,
  Move,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Radio,
  X,
  RefreshCw,
} from 'lucide-react';
import { WinGoSignal } from '../types';
import { sounds } from '../utils/audio';

interface GameEmbedViewProps {
  currentSignal: WinGoSignal | null;
  currentPeriod: string;
  secondsLeft: number;
}

export const GameEmbedView: React.FC<GameEmbedViewProps> = ({
  currentSignal,
  currentPeriod,
  secondsLeft,
}) => {
  const [gameUrl, setGameUrl] = useState(() => {
    return localStorage.getItem('rhxvm_game_url') || 'https://www.google.com';
  });
  const [inputUrl, setInputUrl] = useState(gameUrl);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isInjectorExpanded, setIsInjectorExpanded] = useState(true);
  const [injectorPos, setInjectorPos] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 20,
  });

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    let url = inputUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setGameUrl(url);
    localStorage.setItem('rhxvm_game_url', url);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: injectorPos.x,
      posY: injectorPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    setInjectorPos({
      x: Math.max(10, Math.min(window.innerWidth - 220, dragStartRef.current.posX + deltaX)),
      y: Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.posY + deltaY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3 animate-fadeIn">
      {/* Game Launcher Control Bar */}
      <form
        onSubmit={handleLaunch}
        className="flex items-center gap-2 p-2 rounded-2xl glass-panel border border-cyan-500/30"
      >
        <div className="flex items-center gap-2 pl-2 text-cyan-400 font-orbitron text-xs font-bold whitespace-nowrap">
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">GAME URL:</span>
        </div>

        <input
          type="text"
          placeholder="Paste game website link (e.g. https://...)"
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-code outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-orbitron font-extrabold text-xs shadow-md shadow-cyan-500/20 whitespace-nowrap active:scale-95 transition-all"
        >
          LOAD GAME
        </button>

        <a
          href={gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </form>

      {/* Embedded Game Webview Container */}
      <div className="relative flex-1 min-h-[550px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl">
        <iframe
          src={gameUrl}
          title="Embedded Game Frame"
          className="w-full h-full min-h-[550px] border-0"
          onLoad={() => setIsIframeLoaded(true)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />

        {/* DRAGGABLE CYBERPUNK HUD INJECTOR OVERLAY */}
        <div
          style={{
            position: 'absolute',
            left: `${injectorPos.x}px`,
            top: `${injectorPos.y}px`,
            zIndex: 40,
            touchAction: 'none',
          }}
          className="select-none"
        >
          {/* Floating Orb or Expanded HUD Panel */}
          {isInjectorExpanded ? (
            <div className="w-52 sm:w-56 rounded-2xl bg-gradient-to-b from-slate-950/95 via-gray-900/95 to-slate-950/95 border-2 border-cyan-400 p-3 shadow-2xl shadow-cyan-500/40 backdrop-blur-xl animate-fadeIn">
              {/* Drag Handle Topbar */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="font-orbitron font-extrabold text-[10px] text-cyan-300 tracking-wider">
                    RHXVM V10 HUD
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsInjectorExpanded(false);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* HUD Content */}
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-between text-[10px] font-code text-slate-400">
                  <span>PERIOD: {currentPeriod ? currentPeriod.slice(-4) : '...'}</span>
                  <span className="text-emerald-400 font-bold">00:{String(secondsLeft).padStart(2, '0')}</span>
                </div>

                {/* Big/Small Pill */}
                <div
                  className={`py-1.5 px-3 rounded-xl font-orbitron font-black text-xl tracking-widest text-white shadow-lg ${
                    currentSignal?.size === 'BIG'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/30'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30'
                  }`}
                >
                  {currentSignal?.size || 'SCANNING'}
                </div>

                {/* Target Numbers */}
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-orbitron text-slate-300">
                    <span>TARGETS:</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/40 border border-cyan-400 font-orbitron font-extrabold text-sm text-cyan-300 flex items-center justify-center">
                    {currentSignal?.numbers[0] ?? '—'}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-purple-600/40 border border-purple-400 font-orbitron font-extrabold text-sm text-purple-300 flex items-center justify-center">
                    {currentSignal?.numbers[1] ?? '—'}
                  </div>
                </div>

                {/* Accuracy */}
                <div className="text-[9px] font-code text-cyan-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{currentSignal?.confidence || 94}% CALIBRATED</span>
                </div>
              </div>
            </div>
          ) : (
            /* Minimized Orb Button */
            <button
              onClick={() => {
                sounds.playClick();
                setIsInjectorExpanded(true);
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/50 flex items-center justify-center active:scale-95 cursor-grab active:cursor-grabbing animate-bounce"
            >
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex flex-col items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
                <span className="text-[8px] font-orbitron font-black leading-none text-white mt-0.5">
                  V10
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
