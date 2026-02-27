// Load .env from root before any other imports
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const YahooFinanceCtor = require('yahoo-finance2').default;
const yf = new YahooFinanceCtor({ suppressNotices: ['ripHistorical'] });

async function main() {
    const symbol = process.argv[2] || 'KO';
    const period1 = new Date(Date.now() - 5 * 365 * 86400000);

    for (const mod of ['balance-sheet', 'cash-flow', 'financials'] as const) {
        try {
            const r: any = await yf.fundamentalsTimeSeries(symbol, { period1, module: mod, type: 'annual' }, { validateResult: false });
            console.log(`\n=== module:'${mod}' ===`);
            console.log('Length:', r?.length ?? Object.keys(r ?? {}).length);
            const entry = Array.isArray(r) ? r[0] : r?.[0];
            if (entry) console.log('  entry[0] fields:', Object.keys(entry).join(', '));
            if (entry) console.log('  entry[0] values:', JSON.stringify(entry).slice(0, 400));
        } catch (e: any) {
            console.log(`  module:'${mod}' error:`, e.message.slice(0, 100));
        }
    }
}

main().catch(console.error);
