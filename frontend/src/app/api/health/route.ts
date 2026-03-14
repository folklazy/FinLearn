import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = Date.now();

    try {
        // Test DB connectivity
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            db: { status: 'connected', latencyMs: dbLatency },
            env: process.env.NODE_ENV ?? 'unknown',
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                db: { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown' },
            },
            { status: 503 },
        );
    }
}
