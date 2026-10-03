import { LICENSE_PLANS } from '../types';

export const ACCESS_SECRET = 'RHXVM_V10_SECURE_TOKEN_2026';
export const TELEGRAM_CHANNEL_URL = 'https://t.me/+B6f0J6m4zZFhZWVl';
export const TELEGRAM_HANDLE = '@RHXVM_V10_BOT';
export const UPI_ID = 'rishav-errorx@fam';
export const UPI_NAME = 'Rishav';

/**
 * Generate a unique hardware and environment fingerprint for strict device binding
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'SERVER_DEVICE';

  try {
    const existing = localStorage.getItem('rhxvm_device_id');
    if (existing && existing.length > 8) return existing;

    // Generate canvas hash
    let canvasHash = 'c0';
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('RHXVM_V10_HARDWARE_FINGERPRINT', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('SECURITY_TOKEN', 4, 17);
        const dataUrl = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < dataUrl.length; i++) {
          hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
          hash |= 0;
        }
        canvasHash = Math.abs(hash).toString(36);
      }
    } catch {
      canvasHash = 'c_fallback';
    }

    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const navInfo = `${navigator.userAgent}_${navigator.language}_${navigator.hardwareConcurrency || 4}`;
    const raw = `${canvasHash}_${screenInfo}_${navInfo}`;
    
    // Hash string
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 33) ^ raw.charCodeAt(i);
    }
    const finalId = 'DEV_' + Math.abs(hash >>> 0).toString(16).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem('rhxvm_device_id', finalId);
    return finalId;
  } catch {
    return 'DEV_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

/**
 * Signature computation for license keys
 */
export function computeTokenSignature(payload: string): string {
  let hash = 2166136261;
  const text = payload + '|' + ACCESS_SECRET;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, '0');
}

/**
 * Generate a genuine RHXVM license key
 */
export function generateLicenseKey(planId: string, customDurationMs?: number): { key: string; expiresAt: number } {
  const plan = LICENSE_PLANS.find(p => p.id === planId) || LICENSE_PLANS[0];
  const duration = customDurationMs !== undefined ? customDurationMs : plan.durationMs;
  const now = Date.now();
  const expiresAt = duration === 0 ? 0 : now + duration;
  
  const expiryHex = duration === 0 ? 'PERM' : expiresAt.toString(36).toUpperCase();
  const randSalt = Math.random().toString(36).substring(2, 7).toUpperCase();
  const payload = `RHXVM-${plan.id.toUpperCase()}-${expiryHex}-${randSalt}`;
  const signature = computeTokenSignature(payload);
  
  const key = `${payload}-${signature}`;
  return { key, expiresAt };
}

/**
 * Validate a license key format & cryptographic signature
 */
export function validateLicenseKey(rawKey: string): {
  valid: boolean;
  isPermanent: boolean;
  expiresAt: number;
  planId: string;
  error?: string;
} {
  const key = String(rawKey || '').trim().toUpperCase();
  if (!key) {
    return { valid: false, isPermanent: false, expiresAt: 0, planId: '', error: 'Please enter a license key' };
  }

  // Master bypass keys for admin testing & easy access
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
  if (adminKeys.includes(key)) {
    return { valid: true, isPermanent: true, expiresAt: 0, planId: 'permanent' };
  }

  const parts = key.split('-');
  if (parts.length !== 5 || parts[0] !== 'RHXVM') {
    return { valid: false, isPermanent: false, expiresAt: 0, planId: '', error: 'Invalid key format. Key must start with RHXVM-...' };
  }

  const [, planPart, expiryPart, saltPart, signaturePart] = parts;
  const payload = `RHXVM-${planPart}-${expiryPart}-${saltPart}`;
  const expectedSignature = computeTokenSignature(payload);

  if (signaturePart !== expectedSignature) {
    return { valid: false, isPermanent: false, expiresAt: 0, planId: '', error: 'License key signature invalid or forged' };
  }

  const isPermanent = expiryPart === 'PERM';
  const expiresAt = isPermanent ? 0 : parseInt(expiryPart, 36);

  if (!isPermanent && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) {
    return { valid: false, isPermanent: false, expiresAt, planId: planPart.toLowerCase(), error: 'This license key has expired' };
  }

  return {
    valid: true,
    isPermanent,
    expiresAt,
    planId: planPart.toLowerCase(),
  };
}
