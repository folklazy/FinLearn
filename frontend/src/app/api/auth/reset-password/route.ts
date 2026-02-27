import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, otp, password } = await req.json();

        if (!email || !otp || !password) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
        }

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { email, token: String(otp) },
        });

        if (!resetToken) {
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }, { status: 400 });
        }

        if (resetToken.expires < new Date()) {
            await prisma.passwordResetToken.deleteMany({ where: { email } });
            return NextResponse.json({ error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

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
