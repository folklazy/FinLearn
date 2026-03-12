/**
 * OTP attempt limiter — DB-backed via rate-limiter.
 * Max 5 failed attempts per key before locking out for 15 minutes.
 * Persists across server restarts.
 */

import { checkRateLimit, recordRateLimitFailure, clearRateLimit } from '@/lib/rate-limiter';

const OTP_CONFIG = { maxAttempts: 5, lockoutMs: 15 * 60 * 1000 };

export async function checkOtpAttempt(key: string): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    return checkRateLimit(`otp:${key}`, OTP_CONFIG);
}

export async function recordOtpFailure(key: string): Promise<{ remaining: number; locked: boolean }> {
    return recordRateLimitFailure(`otp:${key}`, OTP_CONFIG);
}

export async function clearOtpAttempts(key: string): Promise<void> {
    return clearRateLimit(`otp:${key}`);
}
