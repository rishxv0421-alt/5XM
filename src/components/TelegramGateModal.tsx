import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle, AlertTriangle, Sparkles, X, Smartphone, Lock } from 'lucide-react';
import { TELEGRAM_CHANNEL_URL, getDeviceFingerprint } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface TelegramGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessClaim: (trialData: any) => void;
  onOpenPricing: () => void;
}

export const TelegramGateModal: React.FC<TelegramGateModalProps> = ({
  isOpen,
  onClose,
  onSuccessClaim,
  onOpenPricing,
}) => {
  const [hasJoinedTG, setHasJoinedTG] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadyClaimedError, setAlreadyClaimedError] = useState(false);

  if (!isOpen) return null;

  const handleTGJoinClick = () => {
    sounds.playClick();
    window.open(TELEGRAM_CHANNEL_URL, '_blank');
    setHasJoinedTG(true);
  };

  const handleClaimTrial = async () => {
    sounds.playClick();
    if (!hasJoinedTG) {
      setErrorMsg('Please click the button above to join our Official Telegram Channel first!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setAlreadyClaimedError(false);

    const deviceId = getDeviceFingerprint();

    try {
      const res = await fetch('/api/trial/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, tgJoined: true }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sounds.playWin();
        sounds.speak('Free 5-minute VIP access activated on your device!');
        onSuccessClaim(data);
        onClose();
      } else {
        sounds.playLoss();
        setErrorMsg(data.error || 'Failed to claim trial.');
        if (data.alreadyClaimed) {
          setAlreadyClaimedError(true);
        }
      }
    } catch {
      // Local fallback in case of direct offline preview
      const localClaimed = localStorage.getItem('rhxvm_trial_claimed_local');
      if (localClaimed) {
        setAlreadyClaimedError(true);
        setErrorMsg('Strict Anti-Abuse: This device has ALREADY claimed the 5-minute free trial once! Please upgrade to a VIP License.');
      } else {
        localStorage.setItem('rhxvm_trial_claimed_local', 'true');
        const now = Date.now();
        const duration = 5 * 60 * 1000;
        sounds.playWin();
        onSuccessClaim({
          claimedAt: now,
          expiresAt: now + duration,
          deviceId,
          durationMs: duration,
        });
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/40 p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 overflow-hidden">
        {/* Glowing cyber accents */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
              <Send className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            STRICT 1-DEVICE FREE TRIAL
          </span>
          <h2 className="font-orbitron font-extrabold text-xl text-white mt-1.5">
            5-MIN FREE VIP ACCESS
          </h2>
          <p className="text-xs text-slate-300 font-rajdhani mt-1">
            Unlock 100% full live AI predictor and game injector for 5 minutes.
            <br />
            <strong className="text-amber-400">Strict Rule:</strong> 1 Device gets access only 1 time after joining our Telegram!
          </p>
        </div>

        {/* Device Fingerprint Card */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-code text-slate-400 mb-4 flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="truncate">
            <span className="text-slate-500">Hardware ID: </span>
            <span className="text-cyan-300 font-bold">{getDeviceFingerprint()}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          {/* Step 1: Join Telegram */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-orbitron font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="text-xs font-orbitron font-bold text-white">
                  Join Official TG Channel
                </h4>
                <p className="text-[11px] font-rajdhani text-blue-300">
                  @RHXVM V10 Official
                </p>
              </div>
            </div>

            <button
              onClick={handleTGJoinClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-extrabold flex items-center gap-1.5 transition-all active:scale-95 ${
                hasJoinedTG
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 animate-pulse'
              }`}
            >
              {hasJoinedTG ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>JOINED</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>JOIN TG</span>
                </>
              )}
            </button>
          </div>

          {/* Step 2: Instant Claim */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-orbitron font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="text-xs font-orbitron font-bold text-white">
                  Start 5-Minute Timer
                </h4>
                <p className="text-[11px] font-rajdhani text-cyan-300">
                  Instant real-time unlock
                </p>
              </div>
            </div>

            <button
              onClick={handleClaimTrial}
              disabled={isLoading || alreadyClaimedError}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-950 font-orbitron font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'VERIFYING...' : 'CLAIM FREE'}
            </button>
          </div>
        </div>

        {/* Error / Warning Alert */}
        {errorMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-rajdhani font-bold flex items-start gap-2.5 ${
              alreadyClaimedError
                ? 'bg-rose-950/70 border border-rose-500/50 text-rose-200'
                : 'bg-amber-950/70 border border-amber-500/50 text-amber-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p>{errorMsg}</p>
              {alreadyClaimedError && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenPricing();
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-gray-950 font-orbitron font-bold text-[10px]"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>VIEW VIP PLANS (₹99 - ₹1499)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] font-code text-slate-500 border-t border-slate-800">
          RHXVM V10 HARDWARE SECURITY GATEWAY · REAL-TIME ENFORCED
        </div>
      </div>
    </div>
  );
};
