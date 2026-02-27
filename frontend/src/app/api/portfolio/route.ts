import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/portfolio — get or create default portfolio + compute positions
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get starting cash from user profile
        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
            select: { simulatorStartingCash: true },
        });
        const startingCash = Number(profile?.simulatorStartingCash ?? 100000);

        // Get or create default portfolio
        let portfolio = await prisma.paperPortfolio.findFirst({
            where: { userId: session.user.id, isDefault: true },
        });
        if (!portfolio) {
            portfolio = await prisma.paperPortfolio.create({
                data: {
                    userId: session.user.id,
                    name: 'Paper Portfolio',
                    startingCash: startingCash,
                    isDefault: true,
                },
            });
        }

        // Fetch all trades with company info
        const trades = await prisma.paperTrade.findMany({
            where: { portfolioId: portfolio.id },
            include: { company: { select: { id: true, ticker: true, name: true } } },
            orderBy: { tradeDate: 'asc' },
        });

        // Compute positions and cash
        let cashBalance = Number(portfolio.startingCash);
        const posMap = new Map<string, { ticker: string; name: string; qty: number; totalCost: number }>();

        for (const trade of trades) {
            const sym = trade.company.ticker;
            const qty = Number(trade.quantity);
            const price = Number(trade.price);
            const fees = Number(trade.fees);

            if (trade.side === 'BUY') {
                cashBalance -= qty * price + fees;
                const cur = posMap.get(sym) ?? { ticker: sym, name: trade.company.name, qty: 0, totalCost: 0 };
                cur.qty += qty;
                cur.totalCost += qty * price + fees;
                posMap.set(sym, cur);
            } else {
                cashBalance += qty * price - fees;
                const cur = posMap.get(sym);
                if (cur) {
                    const avgCost = cur.totalCost / cur.qty;
                    cur.totalCost -= avgCost * qty;
                    cur.qty -= qty;
                    if (cur.qty <= 0.0001) posMap.delete(sym);
                    else posMap.set(sym, cur);
                }
            }
        }

        const positions = Array.from(posMap.values()).map(p => ({
            ticker: p.ticker,
            name: p.name,
            quantity: p.qty,
            avgCost: p.qty > 0 ? p.totalCost / p.qty : 0,
            totalCost: p.totalCost,
        }));

        return NextResponse.json({
            portfolio: {
                id: portfolio.id.toString(),
                name: portfolio.name,
                startingCash,
                cashBalance,
            },
            positions,
            tradeCount: trades.length,
        });
    } catch (err) {
        console.error('Portfolio GET error:', err);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
