import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkOtpAttempt, recordOtpFailure, clearOtpAttempts } from '@/lib/otp-limiter';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        const limiterKey = `reset-check:${email}`;
        const { allowed, retryAfterMs } = await checkOtpAttempt(limiterKey);
        if (!allowed) {
            return NextResponse.json(
                { error: `ลองหลายครั้งเกินไป กรุณารอ ${Math.ceil(retryAfterMs / 60000)} นาทีแล้วลองใหม่` },
                { status: 429 },
            );
        }

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { email, token: String(otp) },
        });

        if (!resetToken) {
            await recordOtpFailure(limiterKey);
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }, { status: 400 });
        }

        if (resetToken.expires < new Date()) {
            await prisma.passwordResetToken.deleteMany({ where: { email } });
            await clearOtpAttempts(limiterKey);
            return NextResponse.json({ error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
        }

        await clearOtpAttempts(limiterKey);
        return NextResponse.json({ ok: true });
    } catch (error) {
        logger.error('Check reset OTP error', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
