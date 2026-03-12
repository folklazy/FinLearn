import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkOtpAttempt, recordOtpFailure, clearOtpAttempts } from '@/lib/otp-limiter';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัส OTP' }, { status: 400 });
        }

        const limiterKey = `verify:${email}`;
        const { allowed, retryAfterMs } = await checkOtpAttempt(limiterKey);
        if (!allowed) {
            return NextResponse.json(
                { error: `ลองหลายครั้งเกินไป กรุณารอ ${Math.ceil(retryAfterMs / 60000)} นาทีแล้วลองใหม่` },
                { status: 429 },
            );
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: { identifier: email, token: String(otp) },
        });

        if (!verificationToken) {
            await recordOtpFailure(limiterKey);
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }, { status: 400 });
        }

        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.deleteMany({ where: { identifier: email } });
            await clearOtpAttempts(limiterKey);
            return NextResponse.json({ error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
        }

        await clearOtpAttempts(limiterKey);
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        await prisma.verificationToken.deleteMany({ where: { identifier: email } });

        return NextResponse.json({ message: 'ยืนยันอีเมลสำเร็จ!' });
    } catch (error) {
        logger.error('Verify email error', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
