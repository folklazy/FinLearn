import crypto from 'crypto';
import prisma from '@/lib/prisma';

export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export async function createVerificationToken(email: string) {
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Upsert: delete old token for this email first (NextAuth VerificationToken schema)
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
    });

    return token;
}

export async function createPasswordResetToken(email: string) {
    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // Delete old tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    await prisma.passwordResetToken.create({
        data: { email, token, expires },
    });

    return token;
}
