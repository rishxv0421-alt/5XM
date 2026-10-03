import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Zap,
  RefreshCw,
  Crown,
  Send,
} from 'lucide-react';
import { LICENSE_PLANS, LicensePlan } from '../types';
import { generateLicenseKey, TELEGRAM_CHANNEL_URL } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface AdminKeyGenModalProps {
  onActivateKey: (keyData: { key: string; planId: string; expiresAt: number; isPermanent: boolean }) => void;
}

export const AdminKeyGenView: React.FC<AdminKeyGenModalProps> = ({ onActivateKey }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1d');
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [keyExpiresAt, setKeyExpiresAt] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const selectedPlan = LICENSE_PLANS.find(p => p.id === selectedPlanId) || LICENSE_PLANS[1];

  const handleGenerate = () => {
    sounds.playClick();
    const result = generateLicenseKey(selectedPlanId);
    setGeneratedKey(result.key);
    setKeyExpiresAt(result.expiresAt);
    sounds.playWin();
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    sounds.playClick();
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectApply = () => {
    if (!generatedKey) return;
    sounds.playJackpot();
    onActivateKey({
      key: generatedKey,
      planId: selectedPlanId,
      expiresAt: keyExpiresAt,
      isPermanent: selectedPlan.durationMs === 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-purple-400 uppercase">
            ADMIN & MASTER GATEWAY
          </span>
          <h2 className="font-orbitron font-black text-xl text-white">
            LICENSE KEY GENERATOR
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-code font-bold">
          <Key className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC V10</span>
        </div>
      </div>

      {/* Main Generator Box */}
      <div className="p-5 rounded-3xl glass-panel border border-purple-500/30 shadow-2xl shadow-purple-500/15 space-y-4">
        {/* Tier Selector */}
        <div>
          <label className="block text-xs font-orbitron font-bold text-slate-200 mb-2">
            SELECT PLAN TIER:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LICENSE_PLANS.map(plan => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPlanId(plan.id);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-orbitron font-bold">{plan.durationLabel}</div>
                  <div className="text-sm font-orbitron font-black text-purple-300 mt-0.5">
                    ₹{plan.priceINR}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Trigger Button */}
        <button
          onClick={handleGenerate}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>GENERATE {selectedPlan.durationLabel.toUpperCase()} KEY</span>
        </button>

        {/* Generated Key Output Box */}
        {generatedKey && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-orbitron font-bold text-purple-300">
              <span>GENERATED KEY:</span>
              <span className="text-[10px] text-emerald-400 font-code">SIGNATURE VALIDATED</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-code font-bold text-sm text-cyan-300 select-all break-all text-center">
              {generatedKey}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED KEY' : 'COPY KEY'}</span>
              </button>

              <button
                onClick={handleDirectApply}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>APPLY TO APP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official TG Key Drop Channel */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-orbitron font-bold text-blue-300">
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>DAILY FREE KEYS ON TELEGRAM</span>
          </div>
          <p className="text-[11px] text-slate-400 font-rajdhani mt-0.5">
            Admin drops free 1-hour and 1-day VIP keys daily in the official channel.
          </p>
        </div>
        <a
          href={TELEGRAM_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-orbitron font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 whitespace-nowrap transition-all"
        >
          JOIN TG
        </a>
      </div>
    </div>
  );
};
