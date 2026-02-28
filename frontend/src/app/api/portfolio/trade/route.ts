import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/portfolio/trade — execute a paper trade
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { symbol, side, quantity, price } = await req.json();

        if (!symbol || !side || !quantity || !price) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }
        if (!['BUY', 'SELL'].includes(side)) {
            return NextResponse.json({ error: 'side ต้องเป็น BUY หรือ SELL' }, { status: 400 });
        }
        if (Number(quantity) <= 0 || Number(price) <= 0) {
            return NextResponse.json({ error: 'จำนวนและราคาต้องมากกว่า 0' }, { status: 400 });
        }

        // Find company by ticker — auto-create from external API if not in local DB
        let company = await prisma.company.findUnique({
            where: { ticker: symbol.toUpperCase() },
        });
        if (!company) {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const stockRes = await fetch(`${apiBase}/api/stocks/${symbol.toUpperCase()}`);
                if (!stockRes.ok) {
                    return NextResponse.json({ error: `ไม่พบหุ้น ${symbol}` }, { status: 404 });
                }
                const stockData = await stockRes.json();
                const companyName: string = stockData?.profile?.name ?? symbol.toUpperCase();
                const exchange: string | undefined = stockData?.profile?.exchange ?? undefined;
                const logoUrl: string | undefined = stockData?.profile?.logo ?? undefined;
                company = await prisma.company.upsert({
                    where: { ticker: symbol.toUpperCase() },
                    update: {},
                    create: { ticker: symbol.toUpperCase(), name: companyName, exchange, logoUrl },
                });
            } catch {
                return NextResponse.json({ error: `ไม่พบหุ้น ${symbol}` }, { status: 404 });
            }
        }

        // Get or create default portfolio
        let portfolio = await prisma.paperPortfolio.findFirst({
            where: { userId: session.user.id, isDefault: true },
        });
        if (!portfolio) {
            const profile = await prisma.userProfile.findUnique({
                where: { userId: session.user.id },
                select: { simulatorStartingCash: true },
            });
            portfolio = await prisma.paperPortfolio.create({
                data: {
                    userId: session.user.id,
                    name: 'Paper Portfolio',
                    startingCash: Number(profile?.simulatorStartingCash ?? 100000),
                    isDefault: true,
                },
            });
        }

        // Recompute current cash & positions
        const trades = await prisma.paperTrade.findMany({
            where: { portfolioId: portfolio.id },
        });

        let cashBalance = Number(portfolio.startingCash);
        const posMap = new Map<bigint, number>();

        for (const t of trades) {
            const q = Number(t.quantity);
            const p = Number(t.price);
            const f = Number(t.fees);
            if (t.side === 'BUY') {
                cashBalance -= q * p + f;
                posMap.set(t.companyId, (posMap.get(t.companyId) ?? 0) + q);
            } else {
                cashBalance += q * p - f;
                posMap.set(t.companyId, (posMap.get(t.companyId) ?? 0) - q);
            }
        }

        const qty = Number(quantity);
        const px = Number(price);
        const cost = qty * px;

        if (side === 'BUY') {
            if (cashBalance < cost) {
                return NextResponse.json({
                    error: `เงินสดไม่พอ (มี $${cashBalance.toFixed(2)}, ต้องการ $${cost.toFixed(2)})`,
                }, { status: 400 });
            }
        } else {
            const held = posMap.get(company.id) ?? 0;
            if (held < qty) {
                return NextResponse.json({
                    error: `จำนวนหุ้นไม่พอ (มี ${held.toFixed(4)} หุ้น, ต้องการ ${qty})`,
                }, { status: 400 });
            }
        }

        // Create trade
        const trade = await prisma.paperTrade.create({
            data: {
                portfolioId: portfolio.id,
                companyId: company.id,
                side: side as 'BUY' | 'SELL',
                tradeDate: new Date(),
                quantity: qty,
                price: px,
                fees: 0,
            },
        });

        return NextResponse.json({
            ok: true,
            tradeId: trade.id.toString(),
            side,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            price: px,
            total: cost,
        });
    } catch (err) {
        console.error('Trade error:', err);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}
