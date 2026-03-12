/**
 * In-memory login attempt limiter.
 * Prevents brute-force attacks on credential login.
 * Max LOGIN_MAX_ATTEMPTS failed attempts per email before lockout.
 */

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // cleanup stale records every 30 min

interface LoginRecord {
    failCount: number;
    lockedUntil: number | null;
    lastAttempt: number;
}

const store = new Map<string, LoginRecord>();

// Periodic cleanup of stale records
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store) {
        if (now - record.lastAttempt > LOGIN_LOCKOUT_MS * 2) {
            store.delete(key);
        }
    }
}, CLEANUP_INTERVAL_MS);

export function checkLoginAttempt(email: string): { allowed: boolean; retryAfterMs: number } {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = store.get(key);

    if (!record) return { allowed: true, retryAfterMs: 0 };

    if (record.lockedUntil && now < record.lockedUntil) {
        return { allowed: false, retryAfterMs: record.lockedUntil - now };
    }

    // Lockout expired — reset
    if (record.lockedUntil && now >= record.lockedUntil) {
        store.delete(key);
        return { allowed: true, retryAfterMs: 0 };
    }

    return { allowed: true, retryAfterMs: 0 };
}

export function recordLoginFailure(email: string): void {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = store.get(key) ?? { failCount: 0, lockedUntil: null, lastAttempt: now };

    record.failCount += 1;
    record.lastAttempt = now;

    if (record.failCount >= LOGIN_MAX_ATTEMPTS) {
        record.lockedUntil = now + LOGIN_LOCKOUT_MS;
    }

    store.set(key, record);
}

export function clearLoginAttempts(email: string): void {
    store.delete(email.toLowerCase());
}
