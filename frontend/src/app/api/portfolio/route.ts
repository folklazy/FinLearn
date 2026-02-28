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

        // Compute positions and cash — FIFO (First In, First Out) cost basis
        let cashBalance = Number(portfolio.startingCash);

        // lotMap: ticker → ordered queue of BUY lots (oldest first)
        type Lot = { qty: number; unitCost: number };
        const lotMap = new Map<string, { name: string; lots: Lot[] }>();

        for (const trade of trades) {
            const sym = trade.company.ticker;
            const qty = Number(trade.quantity);
            const price = Number(trade.price);
            const fees = Number(trade.fees);

            if (trade.side === 'BUY') {
                cashBalance -= qty * price + fees;
                const entry = lotMap.get(sym) ?? { name: trade.company.name, lots: [] };
                // unitCost includes pro-rated fees per share
                entry.lots.push({ qty, unitCost: (qty * price + fees) / qty });
                lotMap.set(sym, entry);
            } else {
                cashBalance += qty * price - fees;
                const entry = lotMap.get(sym);
                if (entry) {
                    // FIFO: deplete oldest lots first
                    let remaining = qty;
                    while (remaining > 0.00001 && entry.lots.length > 0) {
                        const lot = entry.lots[0];
                        if (lot.qty <= remaining + 0.00001) {
                            remaining -= lot.qty;
                            entry.lots.shift();
                        } else {
                            lot.qty -= remaining;
                            remaining = 0;
                        }
                    }
                    if (entry.lots.length === 0) lotMap.delete(sym);
                }
            }
        }

        const positions = Array.from(lotMap.entries()).map(([ticker, { name, lots }]) => {
            const totalQty = lots.reduce((s, l) => s + l.qty, 0);
            const totalCost = lots.reduce((s, l) => s + l.qty * l.unitCost, 0);
            return {
                ticker,
                name,
                quantity: totalQty,
                avgCost: totalQty > 0 ? totalCost / totalQty : 0,
                totalCost,
                // Include individual lots for transparency
                lots: lots.map(l => ({ qty: l.qty, unitCost: l.unitCost })),
            };
        }).filter(p => p.quantity > 0.0001);

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
