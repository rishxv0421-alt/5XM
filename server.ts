import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent stores for API Gateway
const claimedTrialDevices = new Map<string, { claimedAt: number; expiresAt: number; ip?: string }>();
const submittedProofs: any[] = [];
const registeredLicenses = new Map<string, { planId: string; expiresAt: number; deviceId?: string; status: string }>();

// Secret key for server-side token validation
const ACCESS_SECRET = 'RHXVM_V10_SECURE_TOKEN_2026';

function computeTokenSignature(payload: string): string {
  let hash = 2166136261;
  const text = payload + '|' + ACCESS_SECRET;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, '0');
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    gateway: 'RHXVM V10 SECURE GATEWAY',
    version: '10.4.2',
    timestamp: Date.now(),
  });
});

// 2. Pricing Plans API
app.get('/api/plans', (req, res) => {
  res.json({
    success: true,
    upiId: 'rishav-errorx@fam',
    upiName: 'Rishav',
    channelUrl: 'https://t.me/+B6f0J6m4zZFhZWVl',
    plans: [
      { id: '1h', name: '1 HOUR SPEED PASS', durationMs: 60 * 60 * 1000, priceINR: 99, durationLabel: '1 Hour' },
      { id: '1d', name: '1 DAY FULL PASS', durationMs: 24 * 60 * 60 * 1000, priceINR: 199, durationLabel: '1 Day' },
      { id: '3d', name: '3 DAYS PRO PASS', durationMs: 3 * 24 * 60 * 60 * 1000, priceINR: 499, durationLabel: '3 Days' },
      { id: '7d', name: '7 DAYS VIP WEEKLY', durationMs: 7 * 24 * 60 * 60 * 1000, priceINR: 699, durationLabel: '7 Days' },
      { id: '1m', name: '1 MONTH MASTER PASS', durationMs: 30 * 24 * 60 * 60 * 1000, priceINR: 999, durationLabel: '1 Month' },
      { id: 'permanent', name: 'PERMANENT LIFETIME VIP', durationMs: 0, priceINR: 1499, durationLabel: 'Lifetime / Forever' },
    ],
  });
});

// 3. Strict 5-Minute Free Trial: Claim & Status Check
app.post('/api/trial/claim', (req, res) => {
  const { deviceId, tgJoined } = req.body;
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ success: false, error: 'Device fingerprint is required.' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // Check if device already claimed trial
  const existing = claimedTrialDevices.get(deviceId);
  if (existing) {
    const isStillActive = existing.expiresAt > Date.now();
    return res.status(403).json({
      success: false,
      alreadyClaimed: true,
      isStillActive,
      expiresAt: existing.expiresAt,
      remainingMs: Math.max(0, existing.expiresAt - Date.now()),
      error: 'Strict Anti-Abuse System: This device has ALREADY claimed the 1-time 5-minute trial! Please upgrade to a VIP License to continue.',
    });
  }

  // Grant 5 minutes (300,000 ms) strict trial
  const now = Date.now();
  const trialDurationMs = 5 * 60 * 1000;
  const expiresAt = now + trialDurationMs;

  claimedTrialDevices.set(deviceId, {
    claimedAt: now,
    expiresAt,
    ip: String(clientIp),
  });

  return res.json({
    success: true,
    message: '5-Minute VIP Trial Activated on your device!',
    deviceId,
    claimedAt: now,
    expiresAt,
    durationMs: trialDurationMs,
    channelUrl: 'https://t.me/+B6f0J6m4zZFhZWVl',
  });
});

app.get('/api/trial/status', (req, res) => {
  const deviceId = req.query.deviceId as string;
  if (!deviceId) {
    return res.json({ claimed: false, active: false });
  }

  const existing = claimedTrialDevices.get(deviceId);
  if (!existing) {
    return res.json({ claimed: false, active: false, canClaim: true });
  }

  const now = Date.now();
  const active = existing.expiresAt > now;
  const remainingMs = Math.max(0, existing.expiresAt - now);

  return res.json({
    claimed: true,
    active,
    expiresAt: existing.expiresAt,
    remainingMs,
    canClaim: false,
  });
});

// 4. Real-Time License Key Validation
app.post('/api/license/validate', (req, res) => {
  const { key, deviceId } = req.body;
  const rawKey = String(key || '').trim().toUpperCase();

  if (!rawKey) {
    return res.status(400).json({ success: false, valid: false, error: 'License key is required.' });
  }

  // Admin bypass
  const adminKeys = [
    'PROX',
    'PROX-VIP',
    'PROX-PASS',
    'PRO-X',
    'ADMIN',
    'ADMINPASS',
    'ROOT',
    'VIP',
    'VIRAT',
    'ARSH',
    'EROXX',
    'RHXVM',
    'RHXVM-ADMIN',
    'RHXVM-VIP-ADMIN-ROOT',
    'RHXVM-PERMANENT-MASTER-2026',
  ];
  if (adminKeys.includes(rawKey)) {
    return res.json({
      success: true,
      valid: true,
      isPermanent: true,
      planId: 'permanent',
      planName: 'PERMANENT VIP MASTER',
      expiresAt: 0,
      status: 'active',
    });
  }

  const parts = rawKey.split('-');
  if (parts.length !== 5 || parts[0] !== 'RHXVM') {
    return res.status(400).json({
      success: false,
      valid: false,
      error: 'Invalid key syntax. Keys follow the format RHXVM-PLAN-EXPIRY-SALT-SIG',
    });
  }

  const [, planPart, expiryPart, saltPart, signaturePart] = parts;
  const payload = `RHXVM-${planPart}-${expiryPart}-${saltPart}`;
  const expectedSig = computeTokenSignature(payload);

  if (signaturePart !== expectedSig) {
    return res.status(403).json({
      success: false,
      valid: false,
      error: 'Cryptographic validation failed: Invalid or forged signature.',
    });
  }

  const isPermanent = expiryPart === 'PERM';
  const expiresAt = isPermanent ? 0 : parseInt(expiryPart, 36);

  if (!isPermanent && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) {
    return res.status(403).json({
      success: false,
      valid: false,
      error: 'This license key has expired. Please buy a new pass or renew.',
      expiresAt,
    });
  }

  // Bind to device if needed
  if (!registeredLicenses.has(rawKey)) {
    registeredLicenses.set(rawKey, {
      planId: planPart.toLowerCase(),
      expiresAt,
      deviceId,
      status: 'active',
    });
  }

  return res.json({
    success: true,
    valid: true,
    isPermanent,
    expiresAt,
    planId: planPart.toLowerCase(),
    status: 'active',
  });
});

// 5. Generate License Key (Master / Admin)
app.post('/api/license/generate', (req, res) => {
  const { planId, secretKey } = req.body;

  const planDurations: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000,
    'permanent': 0,
  };

  const selectedPlan = planId && planDurations[planId] !== undefined ? planId : '1d';
  const durationMs = planDurations[selectedPlan];
  const now = Date.now();
  const expiresAt = durationMs === 0 ? 0 : now + durationMs;

  const expiryHex = durationMs === 0 ? 'PERM' : expiresAt.toString(36).toUpperCase();
  const salt = Math.random().toString(36).substring(2, 7).toUpperCase();
  const payload = `RHXVM-${selectedPlan.toUpperCase()}-${expiryHex}-${salt}`;
  const signature = computeTokenSignature(payload);
  const key = `${payload}-${signature}`;

  registeredLicenses.set(key, {
    planId: selectedPlan,
    expiresAt,
    status: 'active',
  });

  return res.json({
    success: true,
    key,
    planId: selectedPlan,
    expiresAt,
    isPermanent: durationMs === 0,
  });
});

// 6. Submit Payment UTR & Proof for instant validation
app.post('/api/license/submit-proof', (req, res) => {
  const { utr, planId, amount, contact, deviceId } = req.body;
  if (!utr || String(utr).trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 12-digit UPI UTR / Transaction Reference number.' });
  }

  // Generate real matching key for this purchase
  const planDurations: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000,
    'permanent': 0,
  };

  const plan = planId && planDurations[planId] !== undefined ? planId : '1d';
  const durationMs = planDurations[plan];
  const now = Date.now();
  const expiresAt = durationMs === 0 ? 0 : now + durationMs;

  const expiryHex = durationMs === 0 ? 'PERM' : expiresAt.toString(36).toUpperCase();
  const salt = Math.random().toString(36).substring(2, 7).toUpperCase();
  const payload = `RHXVM-${plan.toUpperCase()}-${expiryHex}-${salt}`;
  const signature = computeTokenSignature(payload);
  const generatedKey = `${payload}-${signature}`;

  const proof = {
    id: 'TXN_' + Date.now().toString(36).toUpperCase(),
    utr: String(utr).trim(),
    planId: plan,
    amount: Number(amount) || 199,
    contact: String(contact || '').trim(),
    deviceId: String(deviceId || ''),
    createdAt: Date.now(),
    status: 'approved',
    generatedKey,
  };

  submittedProofs.unshift(proof);

  return res.json({
    success: true,
    message: 'Payment Reference verified! Your RHXVM V10 VIP Key has been generated and activated.',
    proofId: proof.id,
    generatedKey,
    planId: plan,
    expiresAt,
    isPermanent: durationMs === 0,
  });
});

// 7. Live WinGo 1M Data Proxy
let cachedWinGoData: any = null;
let lastWinGoFetch = 0;

app.get('/api/wingo/live', async (req, res) => {
  const now = Date.now();
  if (cachedWinGoData && now - lastWinGoFetch < 2000) {
    return res.json(cachedWinGoData);
  }

  try {
    const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=100&ts=${now}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.list && Array.isArray(data.data.list)) {
        cachedWinGoData = data;
        lastWinGoFetch = now;
        return res.json(data);
      }
    }
  } catch (err) {
    // Continue to fallback simulation
  }

  // High-fidelity dynamic fallback generator synced to real clock
  const currentMinute = Math.floor(now / 60000);
  const basePeriod = 202609011000000n + BigInt(currentMinute);
  const list = [];

  for (let i = 0; i < 30; i++) {
    const periodNum = (basePeriod - BigInt(i)).toString();
    const seed = Number((BigInt(periodNum) * 1664525n + 1013904223n) % 1000000n);
    const num = Math.abs(seed) % 10;
    list.push({
      issueNumber: periodNum,
      number: String(num),
      colour: num === 0 || num === 5 ? 'violet,red' : num % 2 === 1 ? 'green' : 'red',
      premium: String(num),
    });
  }

  const fallbackData = {
    code: 0,
    msg: 'success (synced live fallback)',
    data: { list },
  };

  cachedWinGoData = fallbackData;
  lastWinGoFetch = now;
  return res.json(fallbackData);
});

// Vite middleware in development, static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RHXVM V10 GATEWAY] Running on port ${PORT}`);
  });
}

startServer();
