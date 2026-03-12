/**
 * Login attempt limiter — DB-backed via rate-limiter.
 * Prevents brute-force attacks on credential login.
 * Max 5 failed attempts per email before 15-minute lockout.
 * Persists across server restarts.
 */

import { checkRateLimit, recordRateLimitFailure, clearRateLimit } from '@/lib/rate-limiter';

const LOGIN_CONFIG = { maxAttempts: 5, lockoutMs: 15 * 60 * 1000 };

export async function checkLoginAttempt(email: string): Promise<{ allowed: boolean; retryAfterMs: number }> {
    const { allowed, retryAfterMs } = await checkRateLimit(`login:${email.toLowerCase()}`, LOGIN_CONFIG);
    return { allowed, retryAfterMs };
}

export async function recordLoginFailure(email: string): Promise<void> {
    await recordRateLimitFailure(`login:${email.toLowerCase()}`, LOGIN_CONFIG);
}

export async function clearLoginAttempts(email: string): Promise<void> {
    await clearRateLimit(`login:${email.toLowerCase()}`);
}
