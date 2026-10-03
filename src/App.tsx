/**
 * RHXVM V10 ON TOP 🔝
 * Quantum AI WinGo Predictor & Real-Time QR License Gateway
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TrialBanner } from './components/TrialBanner';
import { PredictorView } from './components/PredictorView';
import { GameEmbedView } from './components/GameEmbedView';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoryView } from './components/HistoryView';
import { AdminKeyGenView } from './components/AdminKeyGenModal';
import { LockedGateView } from './components/LockedGateView';
import { LicenseGateModal } from './components/LicenseGateModal';
import { TelegramGateModal } from './components/TelegramGateModal';
import { QRPaymentModal } from './components/QRPaymentModal';
import { CelebrationOverlay } from './components/CelebrationOverlay';

import {
  ActiveAccess,
  WinGoSignal,
  PredictionHistoryItem,
  LICENSE_PLANS,
} from './types';
import { calculatePrediction, sizeForNumber } from './utils/predictor';
import { getDeviceFingerprint, TELEGRAM_CHANNEL_URL } from './utils/crypto';
import { sounds } from './utils/audio';

export default function App() {
  // Navigation & Access State
  const [activeTab, setActiveTab] = useState<string>('predictor');
  const [access, setAccess] = useState<ActiveAccess | null>(() => {
    try {
      const saved = localStorage.getItem('rhxvm_active_access');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isPermanent || (parsed.expiresAt && parsed.expiresAt > Date.now())) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [trialTimeLeft, setTrialTimeLeft] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedPlanForQR, setSelectedPlanForQR] = useState<string>('1d');
  const [celebrationData, setCelebrationData] = useState<{
    status: 'WIN' | 'JACKPOT' | 'LOSS';
    period: string;
    number: number;
    prediction?: 'BIG' | 'SMALL';
  } | null>(null);

  // Live WinGo Data
  const [currentPeriod, setCurrentPeriod] = useState<string>('Connecting...');
  const [secondsLeft, setSecondsLeft] = useState<number>(60 - new Date().getSeconds());
  const [currentSignal, setCurrentSignal] = useState<WinGoSignal | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('CONNECTING...');
  const [isPatternDrawerOpen, setIsPatternDrawerOpen] = useState(false);

  const lastProcessedPeriodRef = useRef<string | null>(null);
  const signalsLedgerRef = useRef<Record<string, WinGoSignal>>({});
  const recentNumbersRef = useRef<number[]>([]);
  const isInitialHistoryPopulatedRef = useRef<boolean>(false);

  // 1. Manage Active Access & Strict 5-Min Trial Countdown
  useEffect(() => {
    if (!access) {
      setTrialTimeLeft(0);
      return;
    }

    if (access.isPermanent) {
      setTrialTimeLeft(0);
      return;
    }

    const checkTimer = () => {
      const remainingMs = access.expiresAt - Date.now();
      const secs = Math.max(0, Math.floor(remainingMs / 1000));
      setTrialTimeLeft(secs);

      if (secs <= 0) {
        setAccess(null);
        localStorage.removeItem('rhxvm_active_access');
        sounds.playLoss();
        sounds.speak('Free trial expired. Please unlock a VIP pass to continue.');
        setIsQrModalOpen(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [access]);

  // Save access changes
  const handleUpdateAccess = (newAccess: ActiveAccess) => {
    setAccess(newAccess);
    try {
      localStorage.setItem('rhxvm_active_access', JSON.stringify(newAccess));
    } catch {}
  };

  // 2. Real-Time Countdown Clock sync
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let s = 60 - now.getSeconds();
      if (s === 60) s = 0;
      setSecondsLeft(s);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Live WinGo 1M Data Fetching & Precise Prediction/Result Evaluation Engine
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch('/api/wingo/live');
      if (!res.ok) throw new Error('Network response not ok');
      const json = await res.json();
      const list = json?.data?.list;

      if (Array.isArray(list) && list.length > 0) {
        const top = list[0];
        const latestFinishedPeriod = String(top.issueNumber);
        const nextPeriod = (BigInt(latestFinishedPeriod) + 1n).toString();

        // Extract last numbers for predictor
        const numbers = list.map((item: any) => Number(item.number)).filter(Number.isFinite);
        recentNumbersRef.current = numbers;

        // Populate initial audit history if empty
        if (!isInitialHistoryPopulatedRef.current && list.length >= 5) {
          isInitialHistoryPopulatedRef.current = true;
          const initialItems: PredictionHistoryItem[] = [];
          const maxAudit = Math.min(25, list.length - 2);

          for (let i = 0; i <= maxAudit; i++) {
            const item = list[i];
            const actualNum = Number(item.number);
            const actualSize = sizeForNumber(actualNum);
            const pastNumbers = list.slice(i + 1).map((x: any) => Number(x.number)).filter(Number.isFinite);
            const pred = calculatePrediction(pastNumbers, String(item.issueNumber));

            const isSizeMatch = pred.size === actualSize;
            // Exact primary target number hit
            const isExactNumberMatch = isSizeMatch && pred.number === actualNum;
            const status: 'WIN' | 'JACKPOT' | 'LOSS' = !isSizeMatch
              ? 'LOSS'
              : isExactNumberMatch
              ? 'JACKPOT'
              : 'WIN';

            initialItems.push({
              id: 'HIST_INIT_' + item.issueNumber,
              period: String(item.issueNumber).slice(-4),
              number: actualNum,
              result: actualSize,
              prediction: pred.size,
              predictionNumbers: pred.numbers,
              status,
              time: new Date(Date.now() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: Date.now() - i * 60000,
            });
          }

          setHistory(initialItems);
        }

        // Check if period rolled over to evaluate newly completed round
        if (lastProcessedPeriodRef.current && lastProcessedPeriodRef.current !== latestFinishedPeriod) {
          const actualNum = Number(top.number);
          const actualSize = sizeForNumber(actualNum);

          // Retrieve EXACT prediction signal created for this round
          const savedSignal =
            signalsLedgerRef.current[latestFinishedPeriod] ||
            (currentSignal?.period === latestFinishedPeriod ? currentSignal : null) ||
            calculatePrediction(numbers.slice(1), latestFinishedPeriod);

          const predictedSize = savedSignal.size;
          const predictedNumbers = savedSignal.numbers || [];

          // STRICT MATHEMATICAL WIN/LOSS/JACKPOT EVALUATION
          const isSizeMatch = predictedSize === actualSize;
          const isExactNumberMatch = isSizeMatch && savedSignal.number === actualNum;

          let status: 'WIN' | 'JACKPOT' | 'LOSS';
          if (!isSizeMatch) {
            // E.g. Predicted BIG and actual was SMALL (0, 1, 2, 3, 4) -> STRICT LOSS!
            status = 'LOSS';
          } else if (isExactNumberMatch) {
            // Exact target number hit -> JACKPOT!
            status = 'JACKPOT';
          } else {
            // Normal side match (e.g. Predicted BIG, landed BIG) -> NORMAL WIN!
            status = 'WIN';
          }

          const newHistoryItem: PredictionHistoryItem = {
            id: 'HIST_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
            period: latestFinishedPeriod.slice(-4),
            number: actualNum,
            result: actualSize,
            prediction: predictedSize,
            predictionNumbers: predictedNumbers,
            status,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
          };

          setHistory(prev => [newHistoryItem, ...prev.filter(h => h.period !== newHistoryItem.period).slice(0, 49)]);

          // Audio & Speech Feedback & Result Dialog
          if (status === 'JACKPOT') {
            sounds.playJackpot();
            sounds.speak(`Jackpot hit! Number ${actualNum} matched exact target.`);
          } else if (status === 'WIN') {
            sounds.playWin();
          } else {
            sounds.playLoss();
          }

          setCelebrationData({
            status,
            period: latestFinishedPeriod.slice(-4),
            number: actualNum,
            prediction: predictedSize,
          });
        }

        lastProcessedPeriodRef.current = latestFinishedPeriod;
        setCurrentPeriod(nextPeriod);

        // Generate and record prediction signal for upcoming nextPeriod
        if (!signalsLedgerRef.current[nextPeriod]) {
          const newSignal = calculatePrediction(numbers, nextPeriod);
          signalsLedgerRef.current[nextPeriod] = newSignal;
          setCurrentSignal(newSignal);
        } else {
          setCurrentSignal(signalsLedgerRef.current[nextPeriod]);
        }
      }
    } catch (err) {
      console.warn('Live API sync error:', err);
    }
  }, [currentSignal]);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // 4. Trigger Manual Scan
  const handleTriggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('CONNECTING TO WIN GO SERVER...');
    sounds.playScanRev();

    const messages = [
      'CONNECTING TO WIN GO SERVER...',
      'CALCULATING MARKOV MATRICES...',
      'DECODING QUANTUM STREAK GUARD...',
      'CALIBRATING DUAL TARGET NUMBERS...',
      'RHXVM V10 SIGNAL GENERATED!',
    ];

    const timer = setInterval(() => {
      setScanProgress(prev => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 14) + 10);
        const msgIdx = Math.min(messages.length - 1, Math.floor((next / 100) * messages.length));
        setScanMessage(messages[msgIdx]);

        if (next >= 100) {
          clearInterval(timer);
          setIsScanning(false);
          // Recalculate fresh quantum signal for current upcoming period
          if (recentNumbersRef.current.length > 0 && currentPeriod) {
            const freshSignal = calculatePrediction(recentNumbersRef.current, currentPeriod);
            signalsLedgerRef.current[currentPeriod] = freshSignal;
            setCurrentSignal(freshSignal);
            sounds.playWin();
            sounds.speak(`RHXVM V10 signal is ${freshSignal.size}, numbers ${freshSignal.numbers.join(' and ')}`);
          }
        }
        return next;
      });
    }, 60);
  };

  // Trial success claim handler
  const handleTrialSuccess = (trialData: any) => {
    const newAccess: ActiveAccess = {
      type: 'trial',
      planId: 'trial_5m',
      planName: '5-MIN FREE TRIAL',
      expiresAt: trialData.expiresAt,
      isPermanent: false,
      activatedAt: trialData.claimedAt || Date.now(),
      deviceId: trialData.deviceId || getDeviceFingerprint(),
    };
    handleUpdateAccess(newAccess);
    sounds.playJackpot();
    sounds.speak('5 Minute Free Trial Activated! Enjoy.');
  };

  // License success activation handler
  const handleLicenseSuccess = (keyData: {
    key: string;
    planId: string;
    expiresAt: number;
    isPermanent: boolean;
  }) => {
    const plan = LICENSE_PLANS.find(p => p.id === keyData.planId) || LICENSE_PLANS[1];
    const newAccess: ActiveAccess = {
      type: 'license',
      key: keyData.key,
      planId: keyData.planId,
      planName: plan.name,
      expiresAt: keyData.expiresAt,
      isPermanent: keyData.isPermanent,
      activatedAt: Date.now(),
      deviceId: getDeviceFingerprint(),
    };
    handleUpdateAccess(newAccess);
    sounds.playJackpot();
    sounds.speak('VIP License Activated Successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 scanline-bg flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        access={access}
        trialTimeLeft={trialTimeLeft}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        onOpenTrialModal={() => setIsTrialModalOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Strict 5-Minute Trial Countdown Sticky Banner */}
      {access?.type === 'trial' && trialTimeLeft > 0 && (
        <TrialBanner
          timeLeft={trialTimeLeft}
          onUpgrade={() => {
            setSelectedPlanForQR('1d');
            setIsQrModalOpen(true);
          }}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {/* If app is locked, render the Locked Gate Screen */}
        {!access ? (
          <LockedGateView
            onActivateKey={handleLicenseSuccess}
            onOpenQRPayment={planId => {
              setSelectedPlanForQR(planId);
              setIsQrModalOpen(true);
            }}
            onOpenTrialModal={() => setIsTrialModalOpen(true)}
            isTrialClaimed={Boolean(localStorage.getItem('rhxvm_trial_claimed_local'))}
          />
        ) : (
          <>
            {activeTab === 'predictor' && (
              <PredictorView
                currentPeriod={currentPeriod}
                secondsLeft={secondsLeft}
                currentSignal={currentSignal}
                history={history}
                onTriggerScan={handleTriggerScan}
                isScanning={isScanning}
                scanProgress={scanProgress}
                scanMessage={scanMessage}
                onOpenPatternDrawer={() => setIsPatternDrawerOpen(!isPatternDrawerOpen)}
                isPatternDrawerOpen={isPatternDrawerOpen}
              />
            )}

            {activeTab === 'injector' && (
              <GameEmbedView
                currentSignal={currentSignal}
                currentPeriod={currentPeriod}
                secondsLeft={secondsLeft}
              />
            )}

            {activeTab === 'pricing' && (
              <div className="w-full max-w-2xl mx-auto space-y-4 animate-fadeIn">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    OFFICIAL PRICING & VIP PASSES
                  </span>
                  <h2 className="font-orbitron font-black text-2xl text-white mt-1">
                    RHXVM V10 LICENSE STORE
                  </h2>
                  <p className="text-xs text-slate-300 font-rajdhani">
                    Select your preferred pass and pay via UPI QR (GPay, PhonePe, Paytm, FamPay)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {LICENSE_PLANS.map(plan => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative ${
                        plan.highlight
                          ? 'bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950/90 border-amber-500/50 shadow-xl shadow-amber-500/10 scale-[1.02]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-orbitron font-extrabold rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <h3 className="font-orbitron font-extrabold text-sm text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-2xl font-orbitron font-black text-cyan-400">
                            ₹{plan.priceINR}
                          </span>
                          <span className="text-xs text-slate-400 font-code">/ {plan.durationLabel}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-rajdhani mb-3">{plan.description}</p>

                        <ul className="space-y-1.5 mb-4 text-[11px] font-code text-slate-300">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-emerald-300">
                              <span>✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          setSelectedPlanForQR(plan.id);
                          setIsQrModalOpen(true);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl font-orbitron font-extrabold text-xs shadow-lg active:scale-95 transition-all ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 shadow-amber-500/25'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                        }`}
                      >
                        INSTANT QR BUY (₹{plan.priceINR})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsView history={history} />}

            {activeTab === 'history' && (
              <HistoryView history={history} onClearHistory={() => setHistory([])} />
            )}

            {activeTab === 'keygen' && (
              <AdminKeyGenView onActivateKey={handleLicenseSuccess} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <LicenseGateModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onActivateKey={handleLicenseSuccess}
        onOpenQRPayment={planId => {
          setSelectedPlanForQR(planId);
          setIsQrModalOpen(true);
        }}
        onOpenTrialModal={() => setIsTrialModalOpen(true)}
        isTrialClaimed={Boolean(localStorage.getItem('rhxvm_trial_claimed_local'))}
      />

      <TelegramGateModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onSuccessClaim={handleTrialSuccess}
        onOpenPricing={() => {
          setSelectedPlanForQR('1d');
          setIsQrModalOpen(true);
        }}
      />

      <QRPaymentModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        selectedPlanId={selectedPlanForQR}
        onSuccessPayment={handleLicenseSuccess}
      />

      {celebrationData && (
        <CelebrationOverlay
          status={celebrationData.status}
          period={celebrationData.period}
          number={celebrationData.number}
          prediction={celebrationData.prediction}
          onClose={() => setCelebrationData(null)}
        />
      )}
    </div>
  );
}
