import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'กรุณาระบุอีเมล' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ message: 'หากอีเมลนี้มีในระบบ เราจะส่งลิงก์ยืนยันให้ทันที' });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: 'อีเมลนี้ยืนยันแล้ว' }, { status: 400 });
        }

        try {
            const token = await createVerificationToken(email);
            await sendVerificationEmail(email, token);
        } catch (emailErr) {
            console.error('Resend verification email error:', emailErr);
            return NextResponse.json({ error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบการตั้งค่า SMTP' }, { status: 500 });
        }

        return NextResponse.json({ message: 'ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
