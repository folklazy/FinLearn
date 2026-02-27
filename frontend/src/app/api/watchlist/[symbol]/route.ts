import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/watchlist/[symbol] — check if symbol is in favorites
export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ isFavorite: false });
    }
    const { symbol } = await params;
    const rows = await prisma.$queryRaw<{ symbol: string }[]>`
        SELECT symbol FROM user_favorites WHERE user_id = ${session.user.id} AND symbol = ${symbol.toUpperCase()}
    `;
    return NextResponse.json({ isFavorite: rows.length > 0 });
}

// DELETE /api/watchlist/[symbol] — remove from favorites
export async function DELETE(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }
    const { symbol } = await params;
    await prisma.$executeRaw`
        DELETE FROM user_favorites WHERE user_id = ${session.user.id} AND symbol = ${symbol.toUpperCase()}
    `;
    return NextResponse.json({ ok: true });
}
