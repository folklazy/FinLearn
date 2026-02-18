import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT /api/user/password — เปลี่ยนรหัสผ่าน
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
            { error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' },
            { status: 400 },
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has existing password, verify current password
    if (user.passwordHash) {
        if (!currentPassword) {
            return NextResponse.json(
                { error: 'กรุณาใส่รหัสผ่านปัจจุบัน' },
                { status: 400 },
            );
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
                { status: 400 },
            );
        }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
    });

    return NextResponse.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
}
