'use client';

import { useState } from 'react';
import { Search, BookOpen, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Term {
    term: string;
    termEn: string;
    category: string;
    definition: string;
    example?: string;
}

const TERMS: Term[] = [
    { term: 'P/E Ratio', termEn: 'Price-to-Earnings Ratio', category: 'valuation', definition: 'อัตราส่วนราคาหุ้นต่อกำไรต่อหุ้น ใช้วัดว่าหุ้นแพงหรือถูกเมื่อเทียบกับกำไร ยิ่งต่ำ = ยิ่งถูก (เทียบกับอุตสาหกรรมเดียวกัน)', example: 'หุ้น A ราคา 100 บาท กำไร 10 บาท/หุ้น → P/E = 10 เท่า' },
    { term: 'P/B Ratio', termEn: 'Price-to-Book Ratio', category: 'valuation', definition: 'อัตราส่วนราคาหุ้นต่อมูลค่าทางบัญชี ใช้วัดว่าราคาหุ้นสูงกว่ามูลค่าสินทรัพย์สุทธิแค่ไหน', example: 'P/B = 2 หมายความว่าตลาดตีราคาหุ้นเป็น 2 เท่าของมูลค่าทางบัญชี' },
    { term: 'EPS', termEn: 'Earnings Per Share', category: 'valuation', definition: 'กำไรต่อหุ้น คำนวณจากกำไรสุทธิ ÷ จำนวนหุ้น เป็นตัวชี้วัดความสามารถในการทำกำไรของบริษัท', example: 'บริษัทกำไร 1 ล้าน มีหุ้น 100,000 หุ้น → EPS = 10 บาท/หุ้น' },
    { term: 'Market Cap', termEn: 'Market Capitalization', category: 'basics', definition: 'มูลค่าตลาดรวมของบริษัท = ราคาหุ้น × จำนวนหุ้นทั้งหมด ใช้วัดขนาดของบริษัท', example: 'Apple มี Market Cap ~$3 Trillion = บริษัทที่ใหญ่ที่สุดในโลก' },
    { term: 'Volume', termEn: 'Trading Volume', category: 'trading', definition: 'ปริมาณการซื้อขายหุ้นในช่วงเวลาหนึ่ง (ปกติต่อวัน) Volume สูง = มีคนสนใจซื้อขายเยอะ สภาพคล่องดี' },
    { term: 'Dividend', termEn: 'เงินปันผล', category: 'income', definition: 'เงินที่บริษัทจ่ายคืนให้ผู้ถือหุ้นจากกำไร ปกติจ่ายรายไตรมาสหรือรายปี', example: 'บริษัทจ่าย Dividend $2/หุ้น/ปี ราคาหุ้น $50 → Yield = 4%' },
    { term: 'Dividend Yield', termEn: 'อัตราเงินปันผล', category: 'income', definition: 'เงินปันผลต่อปี ÷ ราคาหุ้น × 100% เป็นตัวบอกว่าลงทุนจะได้ปันผลกี่ % ต่อปี' },
    { term: 'ROE', termEn: 'Return on Equity', category: 'fundamental', definition: 'ผลตอบแทนต่อส่วนของผู้ถือหุ้น = กำไรสุทธิ ÷ ส่วนของผู้ถือหุ้น × 100% ยิ่งสูงยิ่งดี แสดงว่าบริษัทใช้เงินทุนได้มีประสิทธิภาพ', example: 'ROE 20% = ทุกๆ 100 บาทของทุนผู้ถือหุ้น บริษัททำกำไรได้ 20 บาท' },
    { term: 'Current Ratio', termEn: 'อัตราสภาพคล่อง', category: 'fundamental', definition: 'สินทรัพย์หมุนเวียน ÷ หนี้สินหมุนเวียน วัดความสามารถในการชำระหนี้ระยะสั้น ควรมากกว่า 1', example: 'Current Ratio = 2.5 หมายความว่าบริษัทมีสินทรัพย์ 2.5 เท่าของหนี้ระยะสั้น' },
    { term: 'Debt/Equity', termEn: 'อัตราส่วนหนี้สินต่อทุน', category: 'fundamental', definition: 'หนี้สินรวม ÷ ส่วนของผู้ถือหุ้น ยิ่งสูง = ยิ่งมีหนี้เยอะ มีความเสี่ยงสูง', example: 'D/E = 0.5 = มีหนี้เท่ากับครึ่งหนึ่งของทุน ถือว่าต่ำ' },
    { term: 'Revenue', termEn: 'รายได้', category: 'fundamental', definition: 'รายได้รวมจากการดำเนินธุรกิจ (ยังไม่หักค่าใช้จ่าย) เรียกอีกชื่อว่า "Top Line"' },
    { term: 'Net Income', termEn: 'กำไรสุทธิ', category: 'fundamental', definition: 'กำไรหลังหักค่าใช้จ่ายและภาษีทั้งหมดแล้ว เรียกอีกชื่อว่า "Bottom Line"' },
    { term: 'Profit Margin', termEn: 'อัตรากำไร', category: 'fundamental', definition: 'กำไรสุทธิ ÷ รายได้ × 100% วัดว่าทุกๆ 100 บาทรายได้ บริษัทเหลือเป็นกำไรกี่บาท', example: 'Profit Margin 25% = ทุก $100 รายได้ บริษัทเหลือกำไร $25' },
    { term: 'Bull Market', termEn: 'ตลาดขาขึ้น', category: 'trading', definition: 'สภาวะตลาดที่ราคาหุ้นโดยรวมมีแนวโน้มเพิ่มขึ้น นักลงทุนมีความเชื่อมั่น ตรงข้ามกับ Bear Market' },
    { term: 'Bear Market', termEn: 'ตลาดขาลง', category: 'trading', definition: 'สภาวะตลาดที่ราคาหุ้นลดลง 20% หรือมากกว่าจากจุดสูงสุด นักลงทุนกลัวและเทขาย' },
    { term: 'MA (Moving Average)', termEn: 'เส้นค่าเฉลี่ย', category: 'technical', definition: 'ค่าเฉลี่ยราคาหุ้นในช่วงเวลาที่กำหนด เช่น MA50 = เฉลี่ย 50 วัน ใช้ดูแนวโน้มราคา', example: 'ราคาอยู่เหนือ MA200 = แนวโน้มขาขึ้นระยะยาว' },
    { term: 'RSI', termEn: 'Relative Strength Index', category: 'technical', definition: 'ดัชนีความแข็งแกร่งสัมพัทธ์ (0-100) ใช้วัดว่าหุ้นถูกซื้อมากเกินไป (>70) หรือขายมากเกินไป (<30)' },
    { term: 'Support', termEn: 'แนวรับ', category: 'technical', definition: 'ระดับราคาที่มีแรงซื้อมากพอจะหยุดราคาไม่ให้ลดลงต่อ เหมือน "พื้น" ของราคา' },
    { term: 'Resistance', termEn: 'แนวต้าน', category: 'technical', definition: 'ระดับราคาที่มีแรงขายมากพอจะหยุดราคาไม่ให้ขึ้นต่อ เหมือน "เพดาน" ของราคา' },
    { term: 'Portfolio', termEn: 'พอร์ตการลงทุน', category: 'basics', definition: 'กลุ่มสินทรัพย์ทั้งหมดที่ถือครอง เช่น หุ้น พันธบัตร กองทุน ควรกระจายความเสี่ยง (Diversification)' },
    { term: 'Diversification', termEn: 'การกระจายความเสี่ยง', category: 'basics', definition: 'การลงทุนในสินทรัพย์หลายประเภท/หลายอุตสาหกรรม เพื่อลดความเสี่ยงจากการขาดทุน', example: '"อย่าใส่ไข่ทั้งหมดในตะกร้าใบเดียว"' },
    { term: 'S&P 500', termEn: 'Standard & Poor\'s 500', category: 'basics', definition: 'ดัชนีหุ้น 500 บริษัทที่ใหญ่ที่สุดในสหรัฐ เป็นตัวชี้วัดสุขภาพตลาดหุ้นโดยรวม', example: 'FinLearn ใช้หุ้นจาก S&P 500 ในการจำลองพอร์ต' },
    { term: 'IPO', termEn: 'Initial Public Offering', category: 'basics', definition: 'การเสนอขายหุ้นให้สาธารณชนครั้งแรก เปลี่ยนจากบริษัทเอกชนเป็นบริษัทจดทะเบียนในตลาดหุ้น' },
    { term: 'Blue Chip', termEn: 'หุ้นบลูชิป', category: 'basics', definition: 'หุ้นของบริษัทขนาดใหญ่ที่มั่นคง มีประวัติดี จ่ายปันผลสม่ำเสมอ เช่น Apple, Microsoft, Johnson & Johnson' },
    { term: 'Volatility', termEn: 'ความผันผวน', category: 'risk', definition: 'การเปลี่ยนแปลงของราคาหุ้นในช่วงเวลาหนึ่ง ยิ่งผันผวนมาก = ยิ่งเสี่ยงแต่อาจได้ผลตอบแทนสูง' },
    { term: 'Beta', termEn: 'ค่าเบต้า', category: 'risk', definition: 'วัดความผันผวนของหุ้นเทียบกับตลาดรวม Beta > 1 = ผันผวนกว่าตลาด, Beta < 1 = ผันผวนน้อยกว่าตลาด', example: 'Beta = 1.5 → ถ้าตลาดขึ้น 10% หุ้นนี้มีแนวโน้มขึ้น 15%' },
    { term: 'Stop Loss', termEn: 'จุดตัดขาดทุน', category: 'risk', definition: 'ระดับราคาที่ตั้งไว้เพื่อขายหุ้นอัตโนมัติเมื่อราคาลดลงถึงจุดนั้น ป้องกันขาดทุนมากเกินไป', example: 'ซื้อหุ้นที่ $100 ตั้ง Stop Loss ที่ $90 = ยอมขาดทุนสูงสุด 10%' },
    { term: 'Market Order', termEn: 'คำสั่งซื้อ/ขายทันที', category: 'trading', definition: 'คำสั่งซื้อหรือขายหุ้นทันทีที่ราคาตลาดปัจจุบัน ได้ราคาเร็วแต่อาจไม่ได้ราคาที่ต้องการ' },
    { term: 'Limit Order', termEn: 'คำสั่งซื้อ/ขายตามราคา', category: 'trading', definition: 'คำสั่งซื้อหรือขายหุ้นที่ราคาที่กำหนดหรือดีกว่า อาจต้องรอแต่ได้ราคาที่ต้องการ' },
    { term: 'Cash Flow', termEn: 'กระแสเงินสด', category: 'fundamental', definition: 'เงินสดที่ไหลเข้า-ออกจากบริษัท แบ่งเป็น 3 ประเภท: ดำเนินงาน, ลงทุน, จัดหาเงิน กระแสเงินสดดีกว่ากำไรในแง่ตรวจสอบสุขภาพที่แท้จริงของบริษัท' },
];

const CATEGORIES = [
    { key: 'all', label: 'ทั้งหมด', labelEn: 'All' },
    { key: 'basics', label: 'พื้นฐาน', labelEn: 'Basics' },
    { key: 'valuation', label: 'การประเมินมูลค่า', labelEn: 'Valuation' },
    { key: 'fundamental', label: 'ปัจจัยพื้นฐาน', labelEn: 'Fundamental' },
    { key: 'technical', label: 'เทคนิค', labelEn: 'Technical' },
    { key: 'trading', label: 'การซื้อขาย', labelEn: 'Trading' },
    { key: 'income', label: 'รายได้/ปันผล', labelEn: 'Income' },
    { key: 'risk', label: 'ความเสี่ยง', labelEn: 'Risk' },
];

export default function GlossaryPage() {
    const { t, locale } = useI18n();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered = TERMS.filter(term => {
        const matchCategory = activeCategory === 'all' || term.category === activeCategory;
        const q = search.toLowerCase();
        const matchSearch = !q || term.term.toLowerCase().includes(q) || term.termEn.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q);
        return matchCategory && matchSearch;
    });

    return (
        <div className="section" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
            {/* Header */}
            <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <BookOpen size={20} style={{ color: 'var(--primary-light)' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{t('glossary.title')}</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('glossary.subtitle')}</p>
            </div>

            {/* Search */}
            <div className="animate-fade-up delay-1" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                marginBottom: '16px',
            }}>
                <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('glossary.searchPlaceholder')}
                    style={{
                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                        color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit',
                    }}
                />
                {search && (
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category tabs */}
            <div className="animate-fade-up delay-2" style={{
                display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px',
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        style={{
                            padding: '6px 14px', borderRadius: '100px', cursor: 'pointer',
                            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                            background: activeCategory === cat.key ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: activeCategory === cat.key ? '#fff' : 'var(--text-secondary)',
                            border: activeCategory === cat.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                            transition: 'all 0.15s',
                        }}
                    >
                        {locale === 'en' ? cat.labelEn : cat.label}
                    </button>
                ))}
            </div>

            {/* Count */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {filtered.length} {t('glossary.termsCount')}
            </div>

            {/* Terms list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map((term, i) => (
                    <div
                        key={term.term}
                        className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                        style={{
                            padding: '20px 22px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{term.term}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{term.termEn}</span>
                            <span style={{
                                fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                                background: 'rgba(124,108,240,0.08)', color: 'var(--primary-light)',
                                textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                                {CATEGORIES.find(c => c.key === term.category)?.[locale === 'en' ? 'labelEn' : 'label']}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                            {term.definition}
                        </p>
                        {term.example && (
                            <div style={{
                                marginTop: '10px', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6,
                            }}>
                                <strong style={{ color: 'var(--text-secondary)' }}>{t('glossary.example')}</strong> {term.example}
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                        <BookOpen size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.88rem' }}>{t('glossary.noResults')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
