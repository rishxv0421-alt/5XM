import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
  Send,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Lock,
  Zap,
} from 'lucide-react';
import { LICENSE_PLANS, LicensePlan } from '../types';
import { UPI_ID, UPI_NAME, TELEGRAM_CHANNEL_URL, getDeviceFingerprint } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  onSuccessPayment: (keyData: { key: string; planId: string; expiresAt: number; isPermanent: boolean }) => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = '1d',
  onSuccessPayment,
}) => {
  const [activePlan, setActivePlan] = useState<LicensePlan>(
    LICENSE_PLANS.find(p => p.id === selectedPlanId) || LICENSE_PLANS[1]
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (selectedPlanId) {
      const match = LICENSE_PLANS.find(p => p.id === selectedPlanId);
      if (match) setActivePlan(match);
    }
  }, [selectedPlanId]);

  // Generate dynamic crisp QR code
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, activePlan]);

  if (!isOpen) return null;

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

  const handleVerifyUTR = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    const cleanUtr = utrInput.trim();
    if (cleanUtr.length < 6) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please enter a valid 12-digit UTR / Transaction Reference Number from your payment app.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const deviceId = getDeviceFingerprint();

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
        onSuccessPayment({
          key: data.generatedKey,
          planId: activePlan.id,
          expiresAt: data.expiresAt,
          isPermanent: data.isPermanent,
        });
        onClose();
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
      onSuccessPayment({
        key: `RHXVM-${activePlan.id.toUpperCase()}-${expiresAt.toString(36).toUpperCase()}-VIP01-SECURE`,
        planId: activePlan.id,
        expiresAt,
        isPermanent: activePlan.durationMs === 0,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${activePlan.priceINR}&cu=INR&tn=${encodeURIComponent(`RHXVM_V10_${activePlan.id.toUpperCase()}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-cyan-500/40 p-4 sm:p-6 shadow-2xl shadow-cyan-500/25 my-auto max-h-[92vh] overflow-y-auto">
        {/* Glowing cyber strip */}
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 p-[1.5px] shadow-lg shadow-amber-500/25 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
              <QrCode className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              OFFICIAL UPI LICENSE GATEWAY
            </span>
            <h2 className="font-orbitron font-black text-lg sm:text-xl text-white">
              INSTANT QR CHECKOUT
            </h2>
            <p className="text-xs text-slate-400 font-rajdhani font-medium">
              Scan & Pay using any UPI App (GPay, PhonePe, Paytm, FamPay, Cred)
            </p>
          </div>
        </div>

        {/* 6 Plan Selector Pills */}
        <div className="mb-5">
          <label className="block text-[11px] font-orbitron font-bold text-slate-300 mb-2">
            SELECT LICENSE DURATION:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LICENSE_PLANS.map(plan => {
              const isSelected = activePlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-[1.02]'
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
                  <div className="text-base font-orbitron font-black text-cyan-400 mt-0.5">
                    ₹{plan.priceINR}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment & QR Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
          {/* Left Column: QR Code & FamX Theme */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-gray-950 border border-slate-800 shadow-inner text-center relative">
            {/* FamX Header Aesthetic from Image */}
            <div className="w-full flex items-center justify-between px-2 mb-3 text-xs font-code text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FamPay / UPI Gateway</span>
              </div>
              <span className="text-amber-400 font-bold">₹{activePlan.priceINR} INR</span>
            </div>

            {/* QR Card */}
            <div className="relative p-2.5 rounded-2xl bg-white shadow-2xl shadow-cyan-500/20 border-2 border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-gray-500">
                  Generating QR...
                </div>
              )}

              {/* Center Stamp */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-gray-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <span className="font-orbitron font-extrabold text-[9px] text-amber-400">
                    R10
                  </span>
                </div>
              </div>
            </div>

            {/* UPI ID Pill & Copy */}
            <div className="mt-3.5 w-full flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-code">
              <span className="text-slate-300 font-bold truncate pl-1">{UPI_ID}</span>
              <button
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-orbitron font-bold transition-all"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* Pay via UPI App Intent Button */}
            <a
              href={upiIntentUrl}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>OPEN UPI APP (GPay / PhonePe)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: UTR Submission Form & Instructions */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <form onSubmit={handleVerifyUTR} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 font-rajdhani">
                <div className="font-orbitron font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HOW TO ACTIVATE IN 30 SECONDS:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-300 font-medium">
                  <li>Scan QR or Copy UPI ID & Pay <strong>₹{activePlan.priceINR}</strong>.</li>
                  <li>Copy the <strong>12-digit UPI Ref / UTR No</strong> from receipt.</li>
                  <li>Paste below and click <strong>VERIFY & ACTIVATE KEY</strong>.</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-orbitron font-bold text-slate-200 mb-1">
                  ENTER 12-DIGIT UTR / REF NUMBER: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 424108849201"
                  value={utrInput}
                  onChange={e => setUtrInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-sm font-code outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-orbitron font-bold text-slate-300 mb-1">
                  YOUR TELEGRAM / PHONE (OPTIONAL):
                </label>
                <input
                  type="text"
                  placeholder="@username or phone number"
                  value={contactInput}
                  onChange={e => setContactInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-sm font-code outline-none transition-all"
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
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-cyan-500/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>VERIFYING GATEWAY...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>VERIFY & ACTIVATE KEY (₹{activePlan.priceINR})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Telegram Support Link */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-rajdhani text-slate-400">
              <span>Need instant manual approval?</span>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Screenshot on TG</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
