import crypto from 'crypto';
import prisma from '@/lib/prisma';

export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateOTP(): string {
    return String(crypto.randomInt(100000, 999999));
}

export async function createVerificationToken(email: string) {
    const token = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Upsert: delete old token for this email first (NextAuth VerificationToken schema)
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
    });

    return token;
}

export async function createPasswordResetToken(email: string) {
    const token = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete old tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    await prisma.passwordResetToken.create({
        data: { email, token, expires },
    });

    return token;
}
