import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/portfolio/history — last 50 trades
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const portfolio = await prisma.paperPortfolio.findFirst({
            where: { userId: session.user.id, isDefault: true },
        });
        if (!portfolio) {
            return NextResponse.json({ trades: [] });
        }

        const trades = await prisma.paperTrade.findMany({
            where: { portfolioId: portfolio.id },
            include: { company: { select: { ticker: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({
            trades: trades.map(t => ({
                id: t.id.toString(),
                side: t.side,
                ticker: t.company.ticker,
                name: t.company.name,
                quantity: Number(t.quantity),
                price: Number(t.price),
                fees: Number(t.fees),
                total: Number(t.quantity) * Number(t.price),
                tradeDate: t.tradeDate,
                createdAt: t.createdAt,
            })),
        });
    } catch (err) {
        console.error('Portfolio history error:', err);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
