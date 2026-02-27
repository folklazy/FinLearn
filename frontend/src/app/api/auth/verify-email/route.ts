import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token ไม่ถูกต้อง' }, { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
        }

        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier: verificationToken.identifier, token } },
            });
            return NextResponse.json({ error: 'ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่' }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });

        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: verificationToken.identifier, token } },
        });

        return NextResponse.json({ message: 'ยืนยันอีเมลสำเร็จ!' });
    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
