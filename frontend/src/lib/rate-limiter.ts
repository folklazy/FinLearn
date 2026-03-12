/**
 * DB-backed rate limiter — persists across server restarts.
 * Used for login brute-force protection and OTP attempt limiting.
 *
 * Keys follow the pattern: "login:<email>" or "otp-reset:<email>"
 */

import prisma from '@/lib/prisma';

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitConfig {
    maxAttempts?: number;
    lockoutMs?: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
}

export async function checkRateLimit(
    key: string,
    config: RateLimitConfig = {},
): Promise<RateLimitResult> {
    const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const now = new Date();

    const record = await prisma.rateLimitAttempt.findUnique({ where: { key } });

    if (!record) {
        return { allowed: true, remaining: maxAttempts, retryAfterMs: 0 };
    }

    // Still locked out?
    if (record.lockedUntil && record.lockedUntil > now) {
        const retryAfterMs = record.lockedUntil.getTime() - now.getTime();
        return { allowed: false, remaining: 0, retryAfterMs };
    }

    // Lockout expired — clean up and allow
    if (record.lockedUntil && record.lockedUntil <= now) {
        await prisma.rateLimitAttempt.delete({ where: { key } }).catch(() => {});
        return { allowed: true, remaining: maxAttempts, retryAfterMs: 0 };
    }

    return {
        allowed: true,
        remaining: maxAttempts - record.failCount,
        retryAfterMs: 0,
    };
}

export async function recordRateLimitFailure(
    key: string,
    config: RateLimitConfig = {},
): Promise<{ remaining: number; locked: boolean }> {
    const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const lockoutMs = config.lockoutMs ?? DEFAULT_LOCKOUT_MS;
    const now = new Date();

    const record = await prisma.rateLimitAttempt.upsert({
        where: { key },
        create: {
            key,
            failCount: 1,
            lastAttempt: now,
        },
        update: {
            failCount: { increment: 1 },
            lastAttempt: now,
        },
    });

    if (record.failCount >= maxAttempts) {
        await prisma.rateLimitAttempt.update({
            where: { key },
            data: { lockedUntil: new Date(now.getTime() + lockoutMs) },
        });
        return { remaining: 0, locked: true };
    }

    return { remaining: maxAttempts - record.failCount, locked: false };
}

export async function clearRateLimit(key: string): Promise<void> {
    await prisma.rateLimitAttempt.delete({ where: { key } }).catch(() => {});
}

/**
 * Cleanup expired lockouts — call periodically or via cron.
 * Deletes records where lockout has expired AND last attempt is old.
 */
export async function cleanupExpiredLimits(): Promise<number> {
    const cutoff = new Date(Date.now() - DEFAULT_LOCKOUT_MS * 2);
    const result = await prisma.rateLimitAttempt.deleteMany({
        where: {
            lastAttempt: { lt: cutoff },
        },
    });
    return result.count;
}
