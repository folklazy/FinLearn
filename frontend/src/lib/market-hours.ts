// US Market hours utility — Eastern Time (America/New_York)

const HOLIDAYS = new Set([
    // 2025
    '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18',
    '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01',
    '2025-11-27', '2025-12-25',
    // 2026
    '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03',
    '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07',
    '2026-11-26', '2026-12-25',
    // 2027
    '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26',
    '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06',
    '2027-11-25', '2027-12-24',
]);

interface ETComponents {
    year: string;
    month: string;
    day: string;
    hour: number;
    minute: number;
    dateStr: string;  // YYYY-MM-DD
    isWeekend: boolean;
}

function etComponents(utcDate: Date): ETComponents {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
    const p: Record<string, string> = {};
    for (const part of fmt.formatToParts(utcDate)) p[part.type] = part.value;

    const dow = new Date(`${p.year}-${p.month}-${p.day}T12:00:00`).getDay();
    return {
        year: p.year, month: p.month, day: p.day,
        hour: parseInt(p.hour === '24' ? '0' : p.hour),
        minute: parseInt(p.minute),
        dateStr: `${p.year}-${p.month}-${p.day}`,
        isWeekend: dow === 0 || dow === 6,
    };
}

export interface MarketStatus {
    isOpen: boolean;
    isWeekend: boolean;
    isHoliday: boolean;
    message: string;
    etTime: string;   // "09:45 ET"
    dateStr: string;  // ET date "YYYY-MM-DD"
}

export function getMarketStatus(now: Date = new Date()): MarketStatus {
    const et = etComponents(now);
    const isHoliday = HOLIDAYS.has(et.dateStr);
    const timeMin = et.hour * 60 + et.minute;
    const isOpen = !et.isWeekend && !isHoliday && timeMin >= 570 && timeMin < 960; // 9:30–16:00

    let message: string;
    if (et.isWeekend)      message = 'ตลาดปิด (สุดสัปดาห์) — ใช้ราคาปิดล่าสุด';
    else if (isHoliday)    message = 'ตลาดปิด (วันหยุดสหรัฐ) — ใช้ราคาปิดล่าสุด';
    else if (timeMin < 570) message = 'ก่อนเปิดตลาด (เปิด 9:30 AM ET)';
    else if (timeMin >= 960) message = 'หลังปิดตลาด (ปิด 4:00 PM ET)';
    else message = 'ตลาดเปิดอยู่ (9:30–16:00 ET)';

    const etTime = `${String(et.hour).padStart(2, '0')}:${String(et.minute).padStart(2, '0')} ET`;
    return { isOpen, isWeekend: et.isWeekend, isHoliday, message, etTime, dateStr: et.dateStr };
}

/** Returns the most recent US trading date as YYYY-MM-DD (ET) */
export function getLastTradingDateStr(now: Date = new Date()): string {
    const et = etComponents(now);
    const timeMin = et.hour * 60 + et.minute;

    // Build a JS Date representing the ET calendar date at noon (avoids DST edge)
    const candidate = new Date(`${et.dateStr}T12:00:00`);

    // If today hasn't opened yet, start checking from yesterday
    const todayIsTrading = !et.isWeekend && !HOLIDAYS.has(et.dateStr);
    if (!todayIsTrading || timeMin < 570) {
        candidate.setDate(candidate.getDate() - 1);
    }

    for (let i = 0; i < 7; i++) {
        const dow = candidate.getDay();
        const ds = candidate.toISOString().slice(0, 10);
        if (dow !== 0 && dow !== 6 && !HOLIDAYS.has(ds)) return ds;
        candidate.setDate(candidate.getDate() - 1);
    }
    return candidate.toISOString().slice(0, 10);
}

/** Count distinct "day trade" events (same-symbol buy+sell same day) in last N trading days */
export function countDayTrades(
    trades: Array<{ side: string; ticker: string; tradeDate: Date | string }>,
    rollingDays = 5,
): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rollingDays * 2); // approximate (includes weekends)

    const recent = trades.filter(t => new Date(t.tradeDate) >= cutoff);

    // Group by date+ticker
    const byDateTicker = new Map<string, Set<string>>();
    for (const t of recent) {
        const date = typeof t.tradeDate === 'string'
            ? t.tradeDate.slice(0, 10)
            : t.tradeDate.toISOString().slice(0, 10);
        const key = date;
        const sidesKey = `${t.ticker}:${t.side}`;
        if (!byDateTicker.has(key)) byDateTicker.set(key, new Set());
        byDateTicker.get(key)!.add(sidesKey);
    }

    // A day trade = same ticker has both BUY and SELL on same day
    let count = 0;
    for (const [, sides] of byDateTicker) {
        // Find unique tickers that have both BUY and SELL
        const tickers = new Set<string>();
        for (const s of sides) tickers.add(s.split(':')[0]);
        for (const ticker of tickers) {
            if (sides.has(`${ticker}:BUY`) && sides.has(`${ticker}:SELL`)) count++;
        }
    }
    return count;
}

/** Holding period in days */
export function holdingDays(purchaseDateStr: string, now: Date = new Date()): number {
    const purchase = new Date(purchaseDateStr + 'T12:00:00');
    return Math.floor((now.getTime() - purchase.getTime()) / 86400000);
}

/** 'SHORT' = < 1 year, 'LONG' = >= 1 year */
export function gainType(purchaseDateStr: string, now: Date = new Date()): 'SHORT' | 'LONG' {
    return holdingDays(purchaseDateStr, now) < 365 ? 'SHORT' : 'LONG';
}
