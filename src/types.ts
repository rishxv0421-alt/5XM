export interface LicensePlan {
  id: '1h' | '1d' | '3d' | '7d' | '1m' | 'permanent';
  name: string;
  durationLabel: string;
  durationMs: number; // 0 for permanent
  priceINR: number;
  badge?: string;
  highlight?: boolean;
  description: string;
  features: string[];
}

export const LICENSE_PLANS: LicensePlan[] = [
  {
    id: '1h',
    name: '1 HOUR SPEED PASS',
    durationLabel: '1 Hour',
    durationMs: 60 * 60 * 1000,
    priceINR: 99,
    description: 'Instant turbo test access for 60 minutes.',
    features: ['Real-time 1M AI Signals', 'Draggable Game Injector', 'Instant Webview HUD'],
  },
  {
    id: '1d',
    name: '1 DAY FULL PASS',
    durationLabel: '1 Day (24h)',
    durationMs: 24 * 60 * 60 * 1000,
    priceINR: 199,
    badge: 'POPULAR',
    description: 'Complete 24 hours unfiltered live predictions.',
    features: ['All 1M Signals + Numbers', 'Draggable HUD Injector', 'Audio Voice Announcements', 'Priority Server Sync'],
  },
  {
    id: '3d',
    name: '3 DAYS PRO PASS',
    durationLabel: '3 Days (72h)',
    durationMs: 3 * 24 * 60 * 60 * 1000,
    priceINR: 499,
    description: '3 full days of continuous high accuracy signals.',
    features: ['Quantum Pattern Matrix', 'Dual Target Number Predictor', 'Loss Recovery Algorithmic Guard', 'Full Webview Injector'],
  },
  {
    id: '7d',
    name: '7 DAYS VIP WEEKLY',
    durationLabel: '7 Days',
    durationMs: 7 * 24 * 60 * 60 * 1000,
    priceINR: 699,
    badge: 'BEST VALUE',
    highlight: true,
    description: 'Full 1-week elite license with VIP Telegram support.',
    features: ['99.2% Calibrated Algorithm', 'Dual Target Numbers + Single Hit', 'Fast 1-Second Auto Sync', 'VIP Admin Channel Access'],
  },
  {
    id: '1m',
    name: '1 MONTH MASTER PASS',
    durationLabel: '30 Days (1 Month)',
    durationMs: 30 * 24 * 60 * 60 * 1000,
    priceINR: 999,
    badge: 'PRO TRADER',
    description: 'Dedicated 30-day uninterrupted access.',
    features: ['Unlimited Game Injection', 'Markov & N-Gram Advanced Matrix', 'Export Full Historical Data', 'Direct Priority Support'],
  },
  {
    id: 'permanent',
    name: 'PERMANENT LIFETIME VIP',
    durationLabel: 'Lifetime / Forever',
    durationMs: 0, // 0 = permanent
    priceINR: 1499,
    badge: '👑 KING TIER',
    highlight: true,
    description: 'Permanent unrestricted access for lifetime on your device.',
    features: ['Lifetime Free V10+ Updates', 'All Current & Future Games', 'Zero Expiry / Never Renews', 'VIP 1-on-1 Support via TG'],
  },
];

export interface ActiveAccess {
  type: 'trial' | 'license' | 'admin';
  key?: string;
  planId?: string;
  planName?: string;
  expiresAt: number; // timestamp, 0 = permanent
  isPermanent: boolean;
  activatedAt: number;
  deviceId: string;
}

export interface WinGoIssue {
  issueNumber: string;
  number: number;
  colour: string;
  size: 'BIG' | 'SMALL';
}

export interface WinGoSignal {
  period: string;
  size: 'BIG' | 'SMALL';
  number: number;
  numbers: [number, number];
  confidence: number;
  engine: string;
  signals: string[];
  color: 'GREEN' | 'RED' | 'VIOLET';
  timestamp: number;
}

export interface PredictionHistoryItem {
  id: string;
  period: string;
  number: number;
  result: 'BIG' | 'SMALL';
  prediction: 'BIG' | 'SMALL';
  predictionNumbers: [number, number];
  status: 'WIN' | 'LOSS' | 'JACKPOT';
  time: string;
  timestamp: number;
}

export interface PaymentProof {
  id: string;
  utr: string;
  planId: string;
  amount: number;
  contact: string;
  deviceId: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
  generatedKey?: string;
}
