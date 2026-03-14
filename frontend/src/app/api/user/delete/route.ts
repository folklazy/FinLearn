import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;

    try {
        // Delete in correct order to respect foreign key constraints
        // Find all paper portfolios to delete trades first
        const portfolios = await prisma.paperPortfolio.findMany({
            where: { userId },
            select: { id: true },
        });
        const portfolioIds = portfolios.map(p => p.id);

        await prisma.$transaction([
            // Delete trades linked to user's portfolios
            ...(portfolioIds.length > 0 ? [prisma.paperTrade.deleteMany({ where: { portfolioId: { in: portfolioIds } } })] : []),
            prisma.paperPortfolio.deleteMany({ where: { userId } }),
            prisma.userSectorPreference.deleteMany({ where: { userId } }),
            prisma.userProfile.deleteMany({ where: { userId } }),
            prisma.userFavorite.deleteMany({ where: { userId } }),
            prisma.verificationToken.deleteMany({ where: { identifier: session.user.email ?? '' } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.account.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } }),
        ]);

        logger.info('Account deleted', { userId });
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Delete account error', error, { userId });
        return NextResponse.json({ error: 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่' }, { status: 500 });
    }
}
