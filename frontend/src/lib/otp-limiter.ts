/**
 * In-memory OTP attempt limiter.
 * Max 5 failed attempts per email before locking out for LOCKOUT_MS.
 * Resets automatically after LOCKOUT_MS (15 minutes).
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
    count: number;
    lockedUntil: number | null;
}

const store = new Map<string, AttemptRecord>();

export function checkOtpAttempt(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const record = store.get(key) ?? { count: 0, lockedUntil: null };

    if (record.lockedUntil && now < record.lockedUntil) {
        return { allowed: false, remaining: 0, retryAfterMs: record.lockedUntil - now };
    }

    if (record.lockedUntil && now >= record.lockedUntil) {
        store.delete(key);
        return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterMs: 0 };
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - record.count, retryAfterMs: 0 };
}

export function recordOtpFailure(key: string): { remaining: number; locked: boolean } {
    const now = Date.now();
    const record = store.get(key) ?? { count: 0, lockedUntil: null };
    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_MS;
        store.set(key, record);
        return { remaining: 0, locked: true };
    }

    store.set(key, record);
    return { remaining: MAX_ATTEMPTS - record.count, locked: false };
}

export function clearOtpAttempts(key: string): void {
    store.delete(key);
}
