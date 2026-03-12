import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                { status: 400 },
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
                { status: 400 },
            );
        }

        if (password.length < 8 || password.length > 64) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมี 8-64 ตัวอักษร' },
                { status: 400 },
            );
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว และตัวเลขอย่างน้อย 1 ตัว' },
                { status: 400 },
            );
        }

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
                { status: 409 },
            );
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        });

        try {
            const token = await createVerificationToken(email);
            await sendVerificationEmail(email, token);
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
            return NextResponse.json(
                { message: 'สร้างบัญชีสำเร็จ! แต่ไม่สามารถส่งอีเมลยืนยันได้ กรุณาติดต่อผู้ดูแลระบบ', emailError: true },
                { status: 201 },
            );
        }

        return NextResponse.json(
            { message: 'สร้างบัญชีสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี' },
            { status: 201 },
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' },
            { status: 500 },
        );
    }
}
