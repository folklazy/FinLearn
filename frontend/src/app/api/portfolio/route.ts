import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getMarketStatus, countDayTrades, holdingDays, gainType } from '@/lib/market-hours';

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

        // lotMap: ticker → FIFO queue of BUY lots (oldest first)
        type Lot = { qty: number; unitCost: number; purchaseDateStr: string };
        const lotMap = new Map<string, { name: string; lots: Lot[]; realizedPnl: number }>();

        for (const trade of trades) {
            const sym = trade.company.ticker;
            const qty = Number(trade.quantity);
            const price = Number(trade.price);
            const fees = Number(trade.fees);
            const dateStr = trade.tradeDate instanceof Date
                ? trade.tradeDate.toISOString().slice(0, 10)
                : String(trade.tradeDate).slice(0, 10);

            if (trade.side === 'BUY') {
                cashBalance -= qty * price + fees;
                const entry = lotMap.get(sym) ?? { name: trade.company.name, lots: [], realizedPnl: 0 };
                entry.lots.push({ qty, unitCost: (qty * price + fees) / qty, purchaseDateStr: dateStr });
                lotMap.set(sym, entry);
            } else {
                // SELL — FIFO lot matching + realized P/L
                cashBalance += qty * price - fees;
                const entry = lotMap.get(sym);
                if (entry) {
                    let remaining = qty;
                    while (remaining > 0.00001 && entry.lots.length > 0) {
                        const lot = entry.lots[0];
                        const consumed = Math.min(remaining, lot.qty);
                        entry.realizedPnl += consumed * (price - lot.unitCost) - (consumed / qty) * fees;
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

        const now = new Date();
        const positions = Array.from(lotMap.entries()).map(([ticker, { name, lots, realizedPnl }]) => {
            const totalQty = lots.reduce((s, l) => s + l.qty, 0);
            const totalCost = lots.reduce((s, l) => s + l.qty * l.unitCost, 0);
            return {
                ticker,
                name,
                quantity: totalQty,
                avgCost: totalQty > 0 ? totalCost / totalQty : 0,
                totalCost,
                realizedPnl,
                lots: lots.map(l => ({
                    qty: l.qty,
                    unitCost: l.unitCost,
                    purchaseDateStr: l.purchaseDateStr,
                    holdingDays: holdingDays(l.purchaseDateStr, now),
                    gainType: gainType(l.purchaseDateStr, now),
                })),
            };
        }).filter(p => p.quantity > 0.0001);

        // Total realized P/L across ALL positions (open + closed)
        // positions[] only holds still-open tickers; closed-out positions have already been removed
        // so we sum realizedPnl from what's left in lotMap plus positions that were fully closed
        // A simpler approach: re-accumulate from lotMap entries (which include closed positions before delete)
        // Actually realizedPnl is already tracked per entry; for closed positions the entry is deleted.
        // Re-derive properly: sum from a parallel pass that doesn't delete
        let totalRealizedPnl = 0;
        {
            type TmpLot = { qty: number; unitCost: number };
            const tmp = new Map<string, TmpLot[]>();
            for (const t of trades) {
                const sym = t.company.ticker;
                const qty = Number(t.quantity);
                const price = Number(t.price);
                const fees = Number(t.fees);
                if (t.side === 'BUY') {
                    const lots = tmp.get(sym) ?? [];
                    lots.push({ qty, unitCost: (qty * price + fees) / qty });
                    tmp.set(sym, lots);
                } else {
                    const lots = tmp.get(sym);
                    if (lots) {
                        let rem = qty;
                        while (rem > 0.00001 && lots.length > 0) {
                            const lot = lots[0];
                            const consumed = Math.min(rem, lot.qty);
                            totalRealizedPnl += consumed * (price - lot.unitCost) - (consumed / qty) * fees;
                            if (lot.qty <= rem + 0.00001) { rem -= lot.qty; lots.shift(); }
                            else { lot.qty -= rem; rem = 0; }
                        }
                        if (lots.length === 0) tmp.delete(sym);
                    }
                }
            }
        }

        // PDT: count day trades in last 5 calendar days
        const tradeSummary = trades.map(t => ({
            side: t.side,
            ticker: t.company.ticker,
            tradeDate: t.tradeDate,
        }));
        const dayTradeCount = countDayTrades(tradeSummary, 5);

        // Market status
        const marketStatus = getMarketStatus();

        return NextResponse.json({
            portfolio: {
                id: portfolio.id.toString(),
                name: portfolio.name,
                startingCash,
                cashBalance,
                totalRealizedPnl,
                totalReturnPct: startingCash > 0
                    ? ((cashBalance + positions.reduce((s, p) => s + p.totalCost, 0) - startingCash + totalRealizedPnl) / startingCash) * 100
                    : 0,
            },
            positions,
            tradeCount: trades.length,
            dayTradeCount,
            pdtWarning: dayTradeCount >= 3,
            marketStatus,
        });
    } catch (err) {
        console.error('Portfolio GET error:', err);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
