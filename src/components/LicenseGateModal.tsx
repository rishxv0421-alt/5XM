import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Sparkles,
  QrCode,
  Send,
  X,
  Zap,
  CheckCircle,
  AlertTriangle,
  Lock,
  Crown,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { LICENSE_PLANS, LicensePlan } from '../types';
import { TELEGRAM_CHANNEL_URL, validateLicenseKey, getDeviceFingerprint } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface LicenseGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateKey: (keyData: { key: string; planId: string; expiresAt: number; isPermanent: boolean }) => void;
  onOpenQRPayment: (planId: string) => void;
  onOpenTrialModal: () => void;
  isTrialClaimed: boolean;
}

export const LicenseGateModal: React.FC<LicenseGateModalProps> = ({
  isOpen,
  onClose,
  onActivateKey,
  onOpenQRPayment,
  onOpenTrialModal,
  isTrialClaimed,
}) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setErrorMsg('');

    const cleanKey = keyInput.trim().toUpperCase();
    if (!cleanKey) {
      setErrorMsg('Please enter your RHXVM license key.');
      return;
    }

    setIsVerifying(true);

    try {
      // First try server gateway validation
      const deviceId = getDeviceFingerprint();
      const res = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanKey, deviceId }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.valid) {
        sounds.playJackpot();
        sounds.speak('VIP License Activated Successfully!');
        onActivateKey({
          key: cleanKey,
          planId: data.planId,
          expiresAt: data.expiresAt,
          isPermanent: data.isPermanent,
        });
        onClose();
      } else {
        // Local cryptographic fallback
        const localCheck = validateLicenseKey(cleanKey);
        if (localCheck.valid) {
          sounds.playJackpot();
          onActivateKey({
            key: cleanKey,
            planId: localCheck.planId,
            expiresAt: localCheck.expiresAt,
            isPermanent: localCheck.isPermanent,
          });
          onClose();
        } else {
          sounds.playLoss();
          setErrorMsg(data.error || localCheck.error || 'Invalid or expired license key.');
        }
      }
    } catch {
      const localCheck = validateLicenseKey(cleanKey);
      if (localCheck.valid) {
        sounds.playJackpot();
        onActivateKey({
          key: cleanKey,
          planId: localCheck.planId,
          expiresAt: localCheck.expiresAt,
          isPermanent: localCheck.isPermanent,
        });
        onClose();
      } else {
        sounds.playLoss();
        setErrorMsg(localCheck.error || 'Invalid license key.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-cyan-500/40 p-4 sm:p-6 shadow-2xl shadow-cyan-500/25 my-auto max-h-[92vh] overflow-y-auto">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 p-[1.5px] shadow-lg shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
              <QrCode className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            OFFICIAL UPI LICENSE GATEWAY
          </span>
          <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white mt-1">
            UNLOCK RHXVM V10 VIP ACCESS
          </h2>
          <p className="text-xs text-slate-300 font-rajdhani">
            Choose a pass below and scan the FamX / UPI QR to unlock instant access.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {LICENSE_PLANS.map(plan => (
              <div
                key={plan.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-950/90 border-amber-500/50 shadow-lg shadow-amber-500/15'
                    : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                {plan.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-orbitron font-extrabold rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h4 className="font-orbitron font-extrabold text-xs text-white">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className="text-xl font-orbitron font-black text-cyan-400">
                      ₹{plan.priceINR}
                    </span>
                    <span className="text-[10px] text-slate-400 font-code">
                      / {plan.durationLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani line-clamp-2 mb-3">
                    {plan.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenQRPayment(plan.id);
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-orbitron font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 shadow-md shadow-amber-500/20'
                      : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>PAY ₹{plan.priceINR} (QR)</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Min Free Trial Option */}
        {!isTrialClaimed && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-950/60 border border-purple-500/40 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-orbitron font-extrabold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>FIRST TIME USER?</span>
              </div>
              <p className="text-[11px] text-slate-300 font-rajdhani mt-0.5">
                Join our Telegram channel and get 5-minute full predictor access on this device.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
                onOpenTrialModal();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-orbitron font-extrabold text-xs shadow-md shadow-purple-600/20 active:scale-95 whitespace-nowrap transition-all"
            >
              CLAIM 5-MIN
            </button>
          </div>
        )}

        {/* Discreet Key Activation Drawer */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          {!showKeyInput ? (
            <button
              onClick={() => {
                sounds.playClick();
                setShowKeyInput(true);
              }}
              className="text-xs font-rajdhani text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Already purchased or have an Admin VIP key? <strong className="underline text-cyan-300">Enter Key</strong></span>
            </button>
          ) : (
            <form onSubmit={handleActivate} className="space-y-2.5 text-left animate-fadeIn">
              <label className="block text-[11px] font-orbitron font-bold text-slate-300">
                ENTER VIP LICENSE KEY:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="RHXVM-1D-..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-xs font-code tracking-wider outline-none"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-xs active:scale-95 transition-all"
                >
                  {isVerifying ? '...' : 'ACTIVATE'}
                </button>
              </div>
              {errorMsg && (
                <div className="text-[11px] text-rose-400 font-rajdhani font-bold">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Telegram Direct Support */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-rajdhani text-slate-400">
          <span>Need custom payment or support?</span>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Official Telegram Channel</span>
          </a>
        </div>
      </div>
    </div>
  );
};
