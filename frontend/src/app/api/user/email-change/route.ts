import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendEmailChangeOtp } from '@/lib/email';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/user/email-change — send OTP to new email
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
        }

        const { newEmail } = await req.json();
        if (!newEmail || typeof newEmail !== 'string') {
            return NextResponse.json({ error: 'กรุณาระบุอีเมลใหม่' }, { status: 400 });
        }

        const normalized = newEmail.toLowerCase().trim();

        // Check not same as current
        const current = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true },
        });
        if (current?.email === normalized) {
            return NextResponse.json({ error: 'อีเมลใหม่ต้องแตกต่างจากอีเมลปัจจุบัน' }, { status: 400 });
        }

        // Check not already taken
        const existing = await prisma.user.findUnique({ where: { email: normalized } });
        if (existing) {
            return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
        }

        const otp = generateOTP();
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        const identifier = `email-change:${session.user.id}:${normalized}`;

        // Delete old pending tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { identifier: { startsWith: `email-change:${session.user.id}:` } },
        });

        await prisma.verificationToken.create({
            data: { identifier, token: otp, expires },
        });

        try {
            await sendEmailChangeOtp(normalized, otp);
        } catch (err) {
            console.error('Email send error:', err);
            return NextResponse.json({ error: 'ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Email change error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
