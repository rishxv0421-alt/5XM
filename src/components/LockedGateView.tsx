import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Key,
  QrCode,
  Sparkles,
  Send,
  Lock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Flame,
  Crown,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LICENSE_PLANS, LicensePlan } from '../types';
import {
  UPI_ID,
  UPI_NAME,
  TELEGRAM_CHANNEL_URL,
  validateLicenseKey,
  getDeviceFingerprint,
} from '../utils/crypto';
import { sounds } from '../utils/audio';

interface LockedGateViewProps {
  onActivateKey: (keyData: { key: string; planId: string; expiresAt: number; isPermanent: boolean }) => void;
  onOpenQRPayment: (planId: string) => void;
  onOpenTrialModal: () => void;
  isTrialClaimed: boolean;
}

export const LockedGateView: React.FC<LockedGateViewProps> = ({
  onActivateKey,
  onOpenQRPayment,
  onOpenTrialModal,
  isTrialClaimed,
}) => {
  const [activePlan, setActivePlan] = useState<LicensePlan>(LICENSE_PLANS[1]); // Default 1 Day (₹199)
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hidden/Discreet Key Input Section state
  const [showKeyInputModal, setShowKeyInputModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyErrorMsg, setKeyErrorMsg] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    setDeviceId(getDeviceFingerprint());
  }, []);

  // Generate dynamic crisp QR code directly on load for activePlan
  useEffect(() => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${activePlan.priceINR}&cu=INR&tn=${encodeURIComponent(`RHXVM_V10_${activePlan.id.toUpperCase()}`)}`;

    QRCode.toDataURL(upiLink, {
      width: 320,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#f8fafc',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [activePlan]);

  const handleCopyUpi = () => {
    sounds.playClick();
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSelectPlan = (plan: LicensePlan) => {
    sounds.playClick();
    setActivePlan(plan);
    setFeedbackMsg(null);
  };

  // Verify UTR submitted from the front-and-center QR Card
  const handleVerifyUTR = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    const cleanUtr = utrInput.trim();
    if (cleanUtr.length < 6) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please enter a valid 12-digit UTR / Ref Number from your UPI payment.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/license/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: cleanUtr,
          planId: activePlan.id,
          amount: activePlan.priceINR,
          contact: contactInput,
          deviceId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.generatedKey) {
        sounds.playJackpot();
        sounds.speak(`VIP License ${activePlan.durationLabel} activated successfully! Welcome to RHXVM V10.`);
        onActivateKey({
          key: data.generatedKey,
          planId: activePlan.id,
          expiresAt: data.expiresAt,
          isPermanent: data.isPermanent,
        });
      } else {
        sounds.playLoss();
        setFeedbackMsg({
          type: 'error',
          text: data.error || 'Verification failed. Please double-check your UTR or contact Admin on Telegram.',
        });
      }
    } catch {
      // Local fallback key generation if preview offline
      sounds.playJackpot();
      const expiresAt = activePlan.durationMs === 0 ? 0 : Date.now() + activePlan.durationMs;
      onActivateKey({
        key: `RHXVM-${activePlan.id.toUpperCase()}-${expiresAt.toString(36).toUpperCase()}-VIP01-SECURE`,
        planId: activePlan.id,
        expiresAt,
        isPermanent: activePlan.durationMs === 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discreet Key Activation Handler
  const handleDiscreetKeyActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setKeyErrorMsg('');

    const cleanKey = keyInput.trim().toUpperCase();
    if (!cleanKey) {
      setKeyErrorMsg('Please enter your license key.');
      return;
    }

    setIsVerifyingKey(true);

    try {
      const res = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanKey, deviceId }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.valid) {
        sounds.playJackpot();
        sounds.speak('RHXVM V10 VIP Access Granted! Welcome.');
        onActivateKey({
          key: cleanKey,
          planId: data.planId,
          expiresAt: data.expiresAt,
          isPermanent: data.isPermanent,
        });
        setShowKeyInputModal(false);
      } else {
        const localCheck = validateLicenseKey(cleanKey);
        if (localCheck.valid) {
          sounds.playJackpot();
          sounds.speak('RHXVM V10 VIP Access Granted!');
          onActivateKey({
            key: cleanKey,
            planId: localCheck.planId,
            expiresAt: localCheck.expiresAt,
            isPermanent: localCheck.isPermanent,
          });
          setShowKeyInputModal(false);
        } else {
          sounds.playLoss();
          setKeyErrorMsg(data.error || localCheck.error || 'Invalid or expired license key.');
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
        setShowKeyInputModal(false);
      } else {
        sounds.playLoss();
        setKeyErrorMsg('Connection error. Please check your key.');
      }
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${activePlan.priceINR}&cu=INR&tn=${encodeURIComponent(`RHXVM_V10_${activePlan.id.toUpperCase()}`)}`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative rounded-3xl glass-panel border border-cyan-500/40 p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 overflow-hidden text-center">
        <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-orbitron font-extrabold text-[10px] tracking-widest uppercase mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>RHXVM V10 VIP GATEWAY · SCAN TO UNLOCK</span>
        </div>

        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-wider">
          RHXVM V10 ON TOP 🔝
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-rajdhani mt-1 max-w-md mx-auto">
          Private Quantum WinGo 1M AI Predictor Engine. Scan the official UPI QR code below to unlock instant VIP access.
        </p>

        {/* Live Device Fingerprint */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-code text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>DEVICE ID: <strong className="text-cyan-400">{deviceId || 'INITIALIZING...'}</strong></span>
        </div>
      </div>

      {/* HERO SECTION: FRONT & CENTER QR CODE & PAYMENT MODULE */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel border-2 border-amber-500/40 shadow-2xl shadow-amber-500/15 space-y-5">
        {/* Tier Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-orbitron font-bold text-slate-200">
              SELECT VIP PASS DURATION:
            </label>
            <span className="text-[10px] font-code text-amber-400">INSTANT AUTO-UNLOCK</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LICENSE_PLANS.map(plan => {
              const isSelected = activePlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/90 to-slate-950/90 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 text-[8px] font-orbitron font-extrabold rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      {plan.badge}
                    </span>
                  )}
                  <div className="text-[11px] font-orbitron font-extrabold text-white">
                    {plan.durationLabel}
                  </div>
                  <div className="text-base font-orbitron font-black text-amber-400 mt-0.5">
                    ₹{plan.priceINR}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code & Payment Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: FamX Themed Dynamic QR Code */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-gray-950 border border-slate-800 shadow-inner text-center">
            <div className="w-full flex items-center justify-between px-1 mb-2.5 text-xs font-code text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FamPay / UPI Live QR</span>
              </div>
              <span className="text-amber-400 font-bold font-orbitron">₹{activePlan.priceINR} INR</span>
            </div>

            {/* QR Frame */}
            <div className="relative p-2.5 rounded-2xl bg-white shadow-2xl shadow-cyan-500/20 border-2 border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-gray-500 font-code text-xs">
                  Generating Dynamic QR...
                </div>
              )}

              {/* R10 Center Stamp */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-gray-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <span className="font-orbitron font-extrabold text-[9px] text-amber-400">
                    R10
                  </span>
                </div>
              </div>
            </div>

            {/* UPI ID Pill & Copy */}
            <div className="mt-3 w-full flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-code">
              <span className="text-slate-300 font-bold truncate pl-1">{UPI_ID}</span>
              <button
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-orbitron font-bold transition-all"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* Direct Pay via UPI App Intent Button */}
            <a
              href={upiIntentUrl}
              className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>PAY VIA GPAY / PHONEPE / PAYTM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: UTR Submission Form */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <form onSubmit={handleVerifyUTR} className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-300 font-rajdhani">
                <div className="font-orbitron font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>INSTANT ACTIVATION STEPS:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-300 font-medium">
                  <li>Scan QR or copy UPI ID & pay <strong>₹{activePlan.priceINR}</strong>.</li>
                  <li>Copy the <strong>12-digit UPI UTR / Ref No</strong> from receipt.</li>
                  <li>Paste below to automatically unlock your VIP Predictor.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-orbitron font-bold text-slate-200 mb-1">
                  12-DIGIT UPI REF / UTR NUMBER: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 424108849201"
                  value={utrInput}
                  onChange={e => setUtrInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-white text-sm font-code outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-orbitron font-bold text-slate-300 mb-1">
                  YOUR TELEGRAM OR PHONE (OPTIONAL):
                </label>
                <input
                  type="text"
                  placeholder="@username or phone number"
                  value={contactInput}
                  onChange={e => setContactInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-white text-sm font-code outline-none transition-all"
                />
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-rajdhani font-bold ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>VERIFYING GATEWAY...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>VERIFY UTR & UNLOCK VIP (₹{activePlan.priceINR})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Telegram Support Link */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-rajdhani text-slate-400">
              <span>Send receipt for manual VIP approve:</span>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>@Telegram Channel</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM DISCREET ACTIONS (Trial & Hidden Key Entry) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs font-rajdhani">
        {/* Discreet Trial Link */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTrialModal();
          }}
          className="text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Want to test first? <strong className="underline text-purple-300">Claim 5-Min Free Trial</strong></span>
        </button>

        {/* Discreet Hidden Key Entry Trigger */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowKeyInputModal(true);
          }}
          className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span>Already have a VIP Key? <strong className="underline text-cyan-300">Enter Key</strong></span>
        </button>
      </div>

      {/* DISCREET MODAL FOR ENTERING LICENSE KEY (Hidden until clicked) */}
      {showKeyInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-cyan-500/40 p-5 shadow-2xl shadow-cyan-500/20 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-extrabold text-sm text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>ENTER VIP LICENSE KEY</span>
              </h3>
              <button
                onClick={() => setShowKeyInputModal(false)}
                className="text-xs text-slate-400 hover:text-white font-code"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleDiscreetKeyActivate} className="space-y-3">
              <div>
                <label className="block text-xs font-orbitron font-bold text-slate-300 mb-1">
                  RHXVM LICENSE KEY:
                </label>
                <input
                  type="text"
                  placeholder="RHXVM-1D-..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm font-code tracking-wider outline-none"
                />
              </div>

              {keyErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-rajdhani font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{keyErrorMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyInputModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingKey}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-black text-xs shadow-md shadow-cyan-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isVerifyingKey ? 'VALIDATING...' : 'ACTIVATE'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
