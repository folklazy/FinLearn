import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/watchlist — return all favorite symbols for logged-in user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }
    const rows = await prisma.$queryRaw<{ symbol: string }[]>`
        SELECT symbol FROM user_favorites WHERE user_id = ${session.user.id} ORDER BY added_at DESC
    `;
    return NextResponse.json({ symbols: rows.map(r => r.symbol) });
}

// POST /api/watchlist — add symbol to favorites
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }
    const { symbol } = await req.json();
    if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

    await prisma.$executeRaw`
        INSERT INTO user_favorites (user_id, symbol) VALUES (${session.user.id}, ${symbol.toUpperCase()})
        ON CONFLICT DO NOTHING
    `;
    return NextResponse.json({ ok: true });
}
