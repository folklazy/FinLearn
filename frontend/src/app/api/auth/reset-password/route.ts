import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { checkOtpAttempt, recordOtpFailure, clearOtpAttempts } from '@/lib/otp-limiter';

export async function POST(req: NextRequest) {
    try {
        const { email, otp, password } = await req.json();

        if (!email || !otp || !password) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        const limiterKey = `reset-submit:${email}`;
        const { allowed, retryAfterMs } = checkOtpAttempt(limiterKey);
        if (!allowed) {
            return NextResponse.json(
                { error: `ลองหลายครั้งเกินไป กรุณารอ ${Math.ceil(retryAfterMs / 60000)} นาทีแล้วลองใหม่` },
                { status: 429 },
            );
        }

        if (password.length < 8 || password.length > 64) {
            return NextResponse.json({ error: 'รหัสผ่านต้องมี 8-64 ตัวอักษร' }, { status: 400 });
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json({ error: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว และตัวเลขอย่างน้อย 1 ตัว' }, { status: 400 });
        }

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { email, token: String(otp) },
        });

        if (!resetToken) {
            recordOtpFailure(limiterKey);
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }, { status: 400 });
        }

        if (resetToken.expires < new Date()) {
            await prisma.passwordResetToken.deleteMany({ where: { email } });
            return NextResponse.json({ error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        clearOtpAttempts(limiterKey);
        await prisma.user.update({
            where: { email },
            data: { passwordHash },
        });

        await prisma.passwordResetToken.deleteMany({ where: { email } });

        return NextResponse.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
