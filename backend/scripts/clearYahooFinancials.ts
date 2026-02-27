// Load .env from root before any other imports
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { prisma } from '../src/lib/prisma';

async function main() {
    const r1 = await prisma.apiCache.deleteMany({ where: { provider: 'yahoo', dataType: 'financials' } });
    console.log(`Cleared ${r1.count} yahoo:financials entries`);
    const r2 = await prisma.apiCache.deleteMany({ where: { dataType: 'full' } });
    console.log(`Cleared ${r2.count} stockdata:full entries`);
    await prisma.$disconnect();
}

main().catch(console.error);
