import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/user/verify-email-change — verify OTP and update email
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
        }

        const { newEmail, otp } = await req.json();
        if (!newEmail || !otp) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        const normalized = newEmail.toLowerCase().trim();
        const identifier = `email-change:${session.user.id}:${normalized}`;

        const record = await prisma.verificationToken.findFirst({
            where: { identifier, token: String(otp) },
        });

        if (!record) {
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง' }, { status: 400 });
        }

        if (record.expires < new Date()) {
            await prisma.verificationToken.deleteMany({ where: { identifier } });
            return NextResponse.json({ error: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
        }

        // Check email not taken (race condition guard)
        const existing = await prisma.user.findUnique({ where: { email: normalized } });
        if (existing) {
            return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { email: normalized },
        });

        await prisma.verificationToken.deleteMany({ where: { identifier } });

        return NextResponse.json({ ok: true, newEmail: normalized });
    } catch (error) {
        console.error('Verify email change error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
