// ===== Beginner Investment Lessons for FinLearn =====

export interface LessonSection {
    heading: string;
    content: string;
    headingEn?: string;
    contentEn?: string;
}

export interface Lesson {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn?: string;
    category: string;
    module: number;   // 1-8 learning path module
    order: number;    // 1-25 global step order
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // minutes
    icon: string;
    thumbnail: string;
    sections: LessonSection[];
    keyTakeaways: string[];
    keyTakeawaysEn?: string[];
    quiz?: { question: string; questionEn?: string; options: string[]; optionsEn?: string[]; answer: number }[];
}

export interface LessonModule {
    id: number;
    category: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LessonCategory {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    lessonCount: number;
}

// ── 8-step learning path modules ──
export const LEARNING_MODULES: LessonModule[] = [
    { id: 1, category: 'fundamentals', name: 'พื้นฐานตลาดหุ้น', nameEn: 'Stock Market Fundamentals', description: 'รู้จักหุ้น ตลาดหลักทรัพย์ การอ่านราคา และดัชนีสำคัญ', descriptionEn: 'Understand stocks, exchanges, price reading, and key indices', icon: '📚', difficulty: 'beginner' },
    { id: 2, category: 'getting-started', name: 'เริ่มต้นลงทุน', nameEn: 'Getting Started', description: 'เปิดบัญชี เลือกหุ้น คำสั่งซื้อขาย และคำศัพท์สำคัญ', descriptionEn: 'Open an account, pick stocks, order types, and key terms', icon: '🚀', difficulty: 'beginner' },
    { id: 3, category: 'tools', name: 'เครื่องมือการลงทุน', nameEn: 'Investment Tools', description: 'รู้จัก ETF กองทุนรวม และการอ่านกราฟหุ้น', descriptionEn: 'ETFs, mutual funds, and reading stock charts', icon: '🔧', difficulty: 'beginner' },
    { id: 4, category: 'fundamental-analysis', name: 'วิเคราะห์พื้นฐาน', nameEn: 'Fundamental Analysis', description: 'PE Ratio งบการเงิน และโมเดลประเมินมูลค่า', descriptionEn: 'PE Ratio, financial statements, and valuation models', icon: '📊', difficulty: 'intermediate' },
    { id: 5, category: 'technical-analysis', name: 'วิเคราะห์ทางเทคนิค', nameEn: 'Technical Analysis', description: 'Moving Average, RSI, MACD และเปรียบเทียบสองแนวทาง', descriptionEn: 'Moving Average, RSI, MACD and comparing both approaches', icon: '📈', difficulty: 'intermediate' },
    { id: 6, category: 'strategies', name: 'กลยุทธ์การลงทุน', nameEn: 'Investment Strategies', description: 'DCA กระจายพอร์ต และพลังของการลงทุนระยะยาว', descriptionEn: 'DCA, diversification, and the power of long-term investing', icon: '🎯', difficulty: 'intermediate' },
    { id: 7, category: 'risk-management', name: 'บริหารความเสี่ยง', nameEn: 'Risk Management', description: 'เข้าใจความเสี่ยง Stop Loss ข้อผิดพลาด และจิตวิทยาการลงทุน', descriptionEn: 'Understanding risk, Stop Loss, common mistakes, and psychology', icon: '🛡️', difficulty: 'intermediate' },
    { id: 8, category: 'advanced', name: 'ความรู้ขั้นสูง', nameEn: 'Advanced Topics', description: 'เศรษฐกิจมหภาค Options Trading และภาษีค่าธรรมเนียม', descriptionEn: 'Macroeconomics, options trading, and taxes & fees', icon: '🎓', difficulty: 'advanced' },
];

// Legacy categories (backward compat)
export const LESSON_CATEGORIES: LessonCategory[] = [
    { id: 'fundamentals', name: 'พื้นฐานตลาดหุ้น', nameEn: 'Stock Market Fundamentals', icon: '📚', lessonCount: 4 },
    { id: 'getting-started', name: 'เริ่มต้นลงทุน', nameEn: 'Getting Started', icon: '🚀', lessonCount: 4 },
    { id: 'tools', name: 'เครื่องมือการลงทุน', nameEn: 'Investment Tools', icon: '🔧', lessonCount: 2 },
    { id: 'fundamental-analysis', name: 'วิเคราะห์พื้นฐาน', nameEn: 'Fundamental Analysis', icon: '�', lessonCount: 3 },
    { id: 'technical-analysis', name: 'วิเคราะห์ทางเทคนิค', nameEn: 'Technical Analysis', icon: '�', lessonCount: 2 },
    { id: 'strategies', name: 'กลยุทธ์การลงทุน', nameEn: 'Investment Strategies', icon: '🎯', lessonCount: 3 },
    { id: 'risk-management', name: 'บริหารความเสี่ยง', nameEn: 'Risk Management', icon: '🛡️', lessonCount: 4 },
    { id: 'advanced', name: 'ความรู้ขั้นสูง', nameEn: 'Advanced Topics', icon: '🎓', lessonCount: 3 },
];

export const LESSONS: Lesson[] = [
    // ═══════════════════════════════════
    // Module 1: Stock Market Fundamentals
    // ═══════════════════════════════════
    {
        id: 'what-is-stock',
        title: 'หุ้นคืออะไร?',
        titleEn: 'What is a Stock?',
        description: 'เรียนรู้พื้นฐานของหุ้น ทำไมบริษัทถึงออกหุ้น และคุณจะได้ประโยชน์อะไรจากการเป็นผู้ถือหุ้น',
        category: 'fundamentals',
        module: 1,
        order: 1,
        difficulty: 'beginner',
        duration: 8,
        icon: '📈',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'หุ้นคืออะไร?',
                content: 'หุ้น (Stock) คือ ส่วนแบ่งความเป็นเจ้าของในบริษัท เมื่อคุณซื้อหุ้นของบริษัทใดบริษัทหนึ่ง คุณก็กลายเป็น "ผู้ถือหุ้น" หรือ "เจ้าของส่วนหนึ่ง" ของบริษัทนั้น\n\nตัวอย่างเช่น ถ้า Apple มีหุ้นทั้งหมด 15,000 ล้านหุ้น และคุณถือ 100 หุ้น คุณก็เป็นเจ้าของ Apple ในสัดส่วนเล็กๆ',
            },
            {
                heading: 'ทำไมบริษัทถึงออกหุ้น?',
                content: 'บริษัทออกหุ้นเพื่อระดมเงินทุนสำหรับขยายธุรกิจ โดยไม่ต้องกู้เงินจากธนาคาร กระบวนการนี้เรียกว่า IPO (Initial Public Offering) หรือ "การเสนอขายหุ้นต่อสาธารณะครั้งแรก"\n\nเงินที่ได้จากการขายหุ้นจะถูกนำไปใช้ในการวิจัยพัฒนา, ขยายโรงงาน, จ้างพนักงานเพิ่ม หรือซื้อกิจการอื่น',
            },
            {
                heading: 'คุณได้อะไรจากการถือหุ้น?',
                content: '1. **กำไรจากราคาหุ้นที่เพิ่มขึ้น (Capital Gain)** — ถ้าคุณซื้อหุ้น Apple ที่ $100 แล้วราคาขึ้นเป็น $150 คุณก็มีกำไร $50 ต่อหุ้น\n\n2. **เงินปันผล (Dividend)** — บริษัทบางแห่งจ่ายเงินปันผลให้ผู้ถือหุ้นเป็นประจำ เช่น ทุกไตรมาส\n\n3. **สิทธิในการออกเสียง** — ผู้ถือหุ้นมีสิทธิ์โหวตในการประชุมผู้ถือหุ้น เช่น เลือกกรรมการบริษัท',
            },
            {
                heading: 'ตลาดหลักทรัพย์คืออะไร?',
                content: 'ตลาดหลักทรัพย์ (Stock Exchange) เป็นสถานที่ซื้อขายหุ้น ตลาดที่ใหญ่ที่สุดในโลกคือ:\n\n- **NYSE** (New York Stock Exchange) — ตลาดหุ้นที่ใหญ่ที่สุดในโลก\n- **NASDAQ** — เน้นหุ้นเทคโนโลยี เช่น Apple, Microsoft, Google\n- **SET** (Stock Exchange of Thailand) — ตลาดหลักทรัพย์แห่งประเทศไทย\n\nปัจจุบันการซื้อขายส่วนใหญ่ทำผ่านระบบอิเล็กทรอนิกส์ ทำให้คุณสามารถซื้อขายหุ้นได้จากที่บ้านผ่านแอปพลิเคชัน',
            },
        ],
        keyTakeaways: [
            'หุ้นคือส่วนแบ่งความเป็นเจ้าของในบริษัท',
            'บริษัทออกหุ้นเพื่อระดมทุน ผ่านกระบวนการ IPO',
            'นักลงทุนได้ประโยชน์จาก Capital Gain และ Dividend',
            'ตลาดหลักทรัพย์คือสถานที่ซื้อขายหุ้น',
        ],
        quiz: [
            { question: 'หุ้นคืออะไร?', options: ['สัญญากู้เงิน', 'ส่วนแบ่งความเป็นเจ้าของบริษัท', 'เงินฝากธนาคาร', 'กองทุนรวม'], answer: 1 },
            { question: 'IPO คืออะไร?', options: ['การซื้อหุ้นคืน', 'การจ่ายเงินปันผล', 'การเสนอขายหุ้นต่อสาธารณะครั้งแรก', 'การควบรวมกิจการ'], answer: 2 },
            { question: 'วิธีใดที่นักลงทุนได้กำไรจากหุ้น?', options: ['Capital Gain เท่านั้น', 'Dividend เท่านั้น', 'ทั้ง Capital Gain และ Dividend', 'ดอกเบี้ยจากบริษัท'], answer: 2 },
        ],
    },
    {
        id: 'how-to-read-stock-price',
        title: 'อ่านราคาหุ้นอย่างไร?',
        titleEn: 'How to Read Stock Prices',
        description: 'เข้าใจตัวเลขที่เห็นบนหน้าจอ: ราคาเปิด, ราคาปิด, High, Low, Volume และอื่นๆ',
        category: 'fundamentals',
        module: 1,
        order: 3,
        difficulty: 'beginner',
        duration: 10,
        icon: '💰',
        thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ราคาหุ้นที่คุณเห็นบนหน้าจอ',
                content: 'เมื่อคุณดูข้อมูลหุ้น จะเห็นตัวเลขหลายตัว:\n\n- **Current Price (ราคาปัจจุบัน)** — ราคาล่าสุดที่หุ้นถูกซื้อขาย\n- **Change (เปลี่ยนแปลง)** — ราคาเปลี่ยนแปลงเท่าไหร่จากวันก่อน\n- **Change % (เปลี่ยนแปลง %)** — เปลี่ยนแปลงกี่เปอร์เซ็นต์\n\n🟢 สีเขียว = ราคาขึ้น, 🔴 สีแดง = ราคาลง',
            },
            {
                heading: 'OHLCV คืออะไร?',
                content: '**OHLCV** เป็นข้อมูลราคาหุ้นในแต่ละวัน:\n\n- **O (Open)** — ราคาเปิดตลาด (ราคาแรกของวัน)\n- **H (High)** — ราคาสูงสุดของวัน\n- **L (Low)** — ราคาต่ำสุดของวัน\n- **C (Close)** — ราคาปิดตลาด (ราคาสุดท้ายของวัน)\n- **V (Volume)** — จำนวนหุ้นที่ถูกซื้อขายในวันนั้น\n\nVolume สูง = มีคนสนใจซื้อขายหุ้นตัวนี้มาก',
            },
            {
                heading: 'Market Cap คืออะไร?',
                content: '**Market Capitalization (มูลค่าตลาด)** = ราคาหุ้น × จำนวนหุ้นทั้งหมด\n\nตัวอย่าง: Apple ราคา $200 × 15,000 ล้านหุ้น = $3 ล้านล้าน\n\n**ขนาดบริษัทตาม Market Cap:**\n- 🏢 **Mega Cap** — มากกว่า $200B (Apple, Microsoft)\n- 🏢 **Large Cap** — $10B-$200B (มั่นคง เสี่ยงน้อย)\n- 🏢 **Mid Cap** — $2B-$10B (เติบโตปานกลาง)\n- 🏢 **Small Cap** — น้อยกว่า $2B (เติบโตสูง เสี่ยงสูง)',
            },
            {
                heading: '52-Week High/Low',
                content: 'ราคาสูงสุดและต่ำสุดในรอบ 52 สัปดาห์ (1 ปี) ช่วยให้คุณเห็นว่าราคาปัจจุบันอยู่ตรงไหนเมื่อเทียบกับช่วง 1 ปีที่ผ่านมา\n\n- ถ้าราคาใกล้ **52-Week High** = หุ้นกำลังร้อนแรง อาจแพงไปแล้ว\n- ถ้าราคาใกล้ **52-Week Low** = หุ้นกำลังอ่อนแรง แต่อาจเป็นโอกาสซื้อ\n\n⚠️ อย่าตัดสินจากตัวเลขเดียว ต้องดูปัจจัยอื่นร่วมด้วย',
            },
        ],
        keyTakeaways: [
            'ราคาหุ้นมีหลายตัวเลข: Current, Open, High, Low, Close, Volume',
            'Market Cap = ราคาหุ้น × จำนวนหุ้นทั้งหมด',
            'Volume สูง = มีสภาพคล่องดี ซื้อขายง่าย',
            '52-Week High/Low ช่วยเปรียบเทียบราคาปัจจุบัน',
        ],
        quiz: [
            { question: 'OHLCV ตัว V หมายถึงอะไร?', options: ['Value', 'Volatility', 'Volume', 'Velocity'], answer: 2 },
            { question: 'Market Cap คำนวณอย่างไร?', options: ['กำไร × PE Ratio', 'ราคาหุ้น × จำนวนหุ้น', 'รายได้ × 10', 'สินทรัพย์ - หนี้สิน'], answer: 1 },
        ],
    },
    {
    // ═══════════════════════════════════
    // Module 2: Getting Started
    // ═══════════════════════════════════
        id: 'types-of-stocks',
        title: 'ประเภทของหุ้น',
        titleEn: 'Types of Stocks',
        description: 'รู้จักหุ้นแต่ละประเภท: Growth, Value, Dividend, Blue-chip และเลือกให้เหมาะกับตัวเอง',
        category: 'getting-started',
        module: 2,
        order: 6,
        difficulty: 'beginner',
        duration: 12,
        icon: '🏷️',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'หุ้น Growth (หุ้นเติบโต)',
                content: 'หุ้น Growth คือหุ้นของบริษัทที่มีรายได้และกำไรเติบโตเร็วกว่าค่าเฉลี่ย\n\n**ตัวอย่าง:** NVDA (NVIDIA), TSLA (Tesla), AMZN (Amazon)\n\n**ข้อดี:** โอกาสได้กำไรสูง\n**ข้อเสีย:** ราคาผันผวนมาก, มักไม่จ่ายเงินปันผล, PE Ratio สูง\n\n**เหมาะกับ:** นักลงทุนที่รับความเสี่ยงได้สูง และลงทุนระยะยาว',
            },
            {
                heading: 'หุ้น Value (หุ้นคุณค่า)',
                content: 'หุ้น Value คือหุ้นที่ราคาถูกกว่ามูลค่าที่แท้จริง (Undervalued)\n\n**ตัวอย่าง:** BRK-B (Berkshire Hathaway), JPM (JPMorgan)\n\n**วิธีหา:** ดู PE Ratio ต่ำกว่าค่าเฉลี่ยอุตสาหกรรม, PB Ratio < 1\n\n**ข้อดี:** ซื้อถูก มีแนวรับราคา\n**ข้อเสีย:** อาจถูกเพราะมีปัญหาจริงๆ ("Value Trap")\n\n**เหมาะกับ:** นักลงทุนที่ชอบวิเคราะห์ลึก ไม่รีบร้อน',
            },
            {
                heading: 'หุ้น Dividend (หุ้นปันผล)',
                content: 'หุ้น Dividend คือหุ้นที่จ่ายเงินปันผลสม่ำเสมอ ให้รายได้ประจำ\n\n**ตัวอย่าง:** KO (Coca-Cola), JNJ (Johnson & Johnson), PG (Procter & Gamble)\n\n**ดูอะไร:**\n- **Dividend Yield** — อัตราเงินปันผลต่อราคาหุ้น (ดี: 2-6%)\n- **Payout Ratio** — สัดส่วนกำไรที่จ่ายปันผล (ดี: < 60%)\n- **Dividend Growth** — จ่ายปันผลเพิ่มขึ้นทุกปีหรือไม่\n\n**เหมาะกับ:** คนที่ต้องการรายได้ประจำ, ใกล้เกษียณ',
            },
            {
                heading: 'หุ้น Blue-Chip',
                content: 'หุ้น Blue-Chip คือหุ้นของบริษัทขนาดใหญ่ มีชื่อเสียง มั่นคง อยู่มานาน\n\n**ตัวอย่าง:** AAPL, MSFT, GOOGL, JNJ, V\n\n**ลักษณะ:**\n- Market Cap สูงมาก (Mega Cap หรือ Large Cap)\n- อยู่ในดัชนี S&P 500 หรือ Dow Jones\n- มีประวัติกำไรยาวนาน\n- ราคาไม่ผันผวนมากเท่าหุ้นเล็ก\n\n**เหมาะกับ:** มือใหม่ที่ต้องการเริ่มต้นลงทุนอย่างมั่นคง',
            },
        ],
        keyTakeaways: [
            'Growth Stock — เติบโตเร็ว เสี่ยงสูง ไม่จ่ายปันผล',
            'Value Stock — ราคาถูกกว่ามูลค่าจริง ต้องวิเคราะห์ดี',
            'Dividend Stock — จ่ายเงินปันผลสม่ำเสมอ ให้รายได้ประจำ',
            'Blue-Chip — มั่นคง ปลอดภัย เหมาะมือใหม่',
        ],
    },
    {
        id: 'how-to-start-investing',
        title: 'เริ่มต้นลงทุนอย่างไร?',
        titleEn: 'How to Start Investing',
        description: 'ขั้นตอนเริ่มต้นลงทุนตั้งแต่เปิดบัญชี เลือกหุ้น ไปจนถึงวิธีซื้อขาย',
        category: 'getting-started',
        module: 2,
        order: 5,
        difficulty: 'beginner',
        duration: 15,
        icon: '🚀',
        thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ขั้นตอนที่ 1: เตรียมเงินสำรองฉุกเฉินก่อน',
                content: 'ก่อนลงทุน ควรมีเงินสำรองฉุกเฉิน 3-6 เดือนของค่าใช้จ่าย\n\n**ทำไม?** เพราะเงินที่ลงทุนในหุ้นมีโอกาสขาดทุนชั่วคราว ถ้าคุณจำเป็นต้องใช้เงินตอนหุ้นลง คุณจะขาดทุน\n\n**กฎสำคัญ:** ลงทุนด้วยเงินที่ไม่จำเป็นต้องใช้ในระยะสั้น (อย่างน้อย 3-5 ปี)',
            },
            {
                heading: 'ขั้นตอนที่ 2: เปิดบัญชีซื้อขายหุ้น',
                content: '**สำหรับหุ้นสหรัฐ:**\n- Interactive Brokers (IBKR) — ค่าธรรมเนียมถูก รองรับหลายประเทศ\n- Charles Schwab — ค่าคอมมิชชั่น $0\n\n**สำหรับหุ้นไทย:**\n- เปิดบัญชีผ่านโบรกเกอร์ เช่น Bualuang, Settrade, Jitta\n\n**ใช้เวลาเปิดบัญชี:** ประมาณ 1-3 วันทำการ',
            },
            {
                heading: 'ขั้นตอนที่ 3: เริ่มต้นเล็กๆ',
                content: '**เริ่มด้วยเงินน้อยก่อน** เพื่อเรียนรู้:\n\n1. เริ่มด้วย 1-2 ตัว ที่เข้าใจธุรกิจ (เช่น Apple, Google)\n2. ลงทุนเป็นงวดสม่ำเสมอ (Dollar-Cost Averaging)\n3. อย่าใช้เงินกู้หรือ Margin\n4. ตั้งเป้าหมายชัดเจน (เกษียณ? ซื้อบ้าน? สร้างรายได้?)\n\n💡 **Dollar-Cost Averaging (DCA)** = ลงทุนจำนวนเท่าๆ กันทุกเดือน ไม่สนราคา ช่วยลดความเสี่ยงจากราคาผันผวน',
            },
            {
                heading: 'ขั้นตอนที่ 4: ติดตามและเรียนรู้',
                content: 'หลังจากเริ่มลงทุนแล้ว:\n\n- **อ่านข่าว** ของบริษัทที่ลงทุนสม่ำเสมอ\n- **ดูงบการเงิน** ทุกไตรมาส (FinLearn ช่วยอ่านให้เข้าใจง่าย)\n- **อย่าตกใจ** เมื่อราคาลงชั่วคราว — ตลาดหุ้นขึ้นลงเป็นปกติ\n- **เรียนรู้จากข้อผิดพลาด** ทุกนักลงทุนเคยผิดพลาด\n\n⏰ ลงทุนระยะยาว > เก็งกำไรระยะสั้น',
            },
        ],
        keyTakeaways: [
            'มีเงินสำรองฉุกเฉิน 3-6 เดือนก่อนลงทุน',
            'เปิดบัญชีกับโบรกเกอร์ที่น่าเชื่อถือ',
            'เริ่มเล็กๆ ด้วย DCA ลงทุนสม่ำเสมอ',
            'ลงทุนระยะยาว อ่านข่าว ติดตามงบการเงิน',
        ],
    },

    {
        id: 'how-stock-market-works',
        title: 'ตลาดหุ้นทำงานยังไง?',
        titleEn: 'How Does the Stock Market Work?',
        description: 'เข้าใจกลไกตลาดหุ้น: เวลาเปิดปิด, Bid/Ask, การจับคู่คำสั่ง และบทบาทของผู้เล่นในตลาด',
        category: 'fundamentals',
        module: 1,
        order: 2,
        difficulty: 'beginner',
        duration: 12,
        icon: '🏛️',
        thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'เวลาเปิด-ปิดตลาด',
                content: '**ตลาดหุ้นสหรัฐ (NYSE / NASDAQ):**\n- 🕘 เปิด: 9:30 AM ET (20:30 เวลาไทย)\n- 🕓 ปิด: 4:00 PM ET (03:00 เวลาไทย)\n- เปิดวันจันทร์-ศุกร์ ปิดวันหยุดนักขัตฤกษ์\n\n**Pre-Market & After-Hours:**\n- Pre-Market: 4:00-9:30 AM ET — ซื้อขายก่อนตลาดเปิด\n- After-Hours: 4:00-8:00 PM ET — ซื้อขายหลังตลาดปิด\n- ⚠️ ช่วงนี้สภาพคล่องต่ำ ราคาอาจผันผวนมาก ไม่แนะนำสำหรับมือใหม่\n\n**ตลาดหุ้นไทย (SET):**\n- เช้า: 10:00-12:30 น.\n- บ่าย: 14:30-16:30 น.',
            },
            {
                heading: 'ใครเป็นคนซื้อขายในตลาด?',
                content: '**ผู้เล่นหลักในตลาดหุ้น:**\n\n1. **นักลงทุนรายย่อย (Retail Investors)** — คนธรรมดาอย่างเราที่ซื้อขายผ่านแอป เช่น Robinhood, Interactive Brokers\n2. **นักลงทุนสถาบัน (Institutional Investors)** — กองทุน, ธนาคาร, บริษัทประกัน ซื้อขายทีละหลายล้านดอลลาร์\n3. **Market Makers** — บริษัทที่คอยตั้งราคาซื้อ/ขายตลอดเวลา ทำให้ตลาดมีสภาพคล่อง\n4. **โบรกเกอร์ (Broker)** — ตัวกลางที่ช่วยส่งคำสั่งซื้อขายของคุณไปยังตลาด\n\n💡 ปัจจุบันนักลงทุนรายย่อยมีอิทธิพลมากขึ้นมาก เพราะค่าคอมมิชชัน $0 และแอปที่ใช้ง่าย',
            },
            {
                heading: 'Bid / Ask คืออะไร?',
                content: 'เวลาดูราคาหุ้น คุณจะเห็นสองราคา:\n\n**Bid** = ราคาสูงสุดที่มีคนยินดี **ซื้อ**\n**Ask** = ราคาต่ำสุดที่มีคนยินดี **ขาย**\n**Spread** = ส่วนต่างระหว่าง Bid กับ Ask\n\nตัวอย่าง AAPL:\n- Bid: $199.50 (คนอยากซื้อที่ราคานี้)\n- Ask: $199.55 (คนอยากขายที่ราคานี้)\n- Spread: $0.05\n\n**Spread แคบ** = สภาพคล่องดี ซื้อขายง่าย (หุ้นใหญ่ เช่น AAPL, MSFT)\n**Spread กว้าง** = สภาพคล่องน้อย ซื้อขายยาก (หุ้นเล็ก)\n\n💡 เวลาซื้อด้วย Market Order คุณจะได้ราคา Ask เวลาขายจะได้ราคา Bid',
            },
            {
                heading: 'เมื่อคุณกด "ซื้อ" เกิดอะไรขึ้น?',
                content: 'ขั้นตอนเบื้องหลังเมื่อคุณซื้อหุ้น:\n\n1. 📱 คุณกด "ซื้อ" ในแอป\n2. 📤 คำสั่งถูกส่งไปยัง **โบรกเกอร์**\n3. 🏛️ โบรกเกอร์ส่งคำสั่งไปที่ **ตลาดหลักทรัพย์**\n4. 🔄 ระบบ **จับคู่** คำสั่งซื้อกับคำสั่งขายที่ตรงกัน\n5. ✅ จับคู่สำเร็จ = **Executed** (ซื้อขายเสร็จ)\n6. 📊 หุ้นเข้าบัญชี (Settlement: **T+1**)\n\n**T+1** หมายถึง หลังซื้อขาย 1 วันทำการ หุ้นจะโอนเข้าบัญชีจริง\n\n💡 ทุกอย่างเกิดขึ้นภายในเสี้ยววินาทีด้วยระบบอิเล็กทรอนิกส์',
            },
        ],
        keyTakeaways: [
            'ตลาดสหรัฐเปิด 9:30-16:00 ET (20:30-03:00 เวลาไทย)',
            'Bid = ราคาซื้อ, Ask = ราคาขาย, Spread = ส่วนต่าง',
            'Spread แคบ = สภาพคล่องดี ซื้อขายง่าย',
            'การซื้อขาย settle ภายใน T+1 วันทำการ',
        ],
        quiz: [
            { question: 'Bid คืออะไร?', options: ['ราคาที่ผู้ขายตั้ง', 'ราคาสูงสุดที่ผู้ซื้อยินดีจ่าย', 'ราคาเปิดตลาด', 'ราคาเฉลี่ยของวัน'], answer: 1 },
            { question: 'T+1 หมายถึงอะไร?', options: ['ซื้อได้แค่ 1 หุ้น', 'หุ้น settle ใน 1 วันทำการหลังซื้อขาย', 'ตลาดเปิด 1 ชั่วโมง', 'ค่าคอมมิชชัน 1%'], answer: 1 },
        ],
    },
    {
        id: 'order-types',
        title: 'คำสั่งซื้อขายหุ้นมีกี่แบบ?',
        titleEn: 'Types of Stock Orders',
        description: 'รู้จักคำสั่งซื้อขาย: Market Order, Limit Order, Stop Order และเมื่อไหร่ควรใช้แบบไหน',
        category: 'getting-started',
        module: 2,
        order: 7,
        difficulty: 'beginner',
        duration: 10,
        icon: '🛒',
        thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Market Order (คำสั่งซื้อ/ขายทันที)',
                content: '**Market Order** = ซื้อหรือขายทันที ณ ราคาที่ดีที่สุดในตอนนั้น\n\n**ข้อดี:**\n- ✅ ได้หุ้นทันที 100%\n- ✅ ใช้ง่ายที่สุด เหมาะมือใหม่\n\n**ข้อเสีย:**\n- ❌ ไม่สามารถกำหนดราคาได้\n- ❌ ถ้าหุ้นมีสภาพคล่องต่ำ อาจได้ราคาแย่ (Slippage)\n\n**เมื่อไหร่ใช้:**\n- ต้องการซื้อ/ขายทันที\n- หุ้นตัวใหญ่ที่มีสภาพคล่องสูง (เช่น AAPL, MSFT)\n\nตัวอย่าง: "ซื้อ AAPL 10 หุ้น Market Order" → ได้ทันที ราคาประมาณ Ask',
            },
            {
                heading: 'Limit Order (คำสั่งซื้อ/ขายตามราคาที่กำหนด)',
                content: '**Limit Order** = ตั้งราคาที่ต้องการ ระบบจะซื้อ/ขายก็ต่อเมื่อราคาถึงที่กำหนด\n\n**Buy Limit:** ตั้งราคาซื้อ **ต่ำกว่า** ราคาปัจจุบัน\nตัวอย่าง: AAPL ราคา $200 → ตั้ง Buy Limit $190 → ซื้อเมื่อราคาลงมาถึง $190\n\n**Sell Limit:** ตั้งราคาขาย **สูงกว่า** ราคาปัจจุบัน\nตัวอย่าง: ถือ AAPL อยู่ → ตั้ง Sell Limit $220 → ขายเมื่อราคาขึ้นถึง $220\n\n**ข้อดี:** ได้ราคาที่ต้องการ\n**ข้อเสีย:** อาจไม่ได้ซื้อ/ขายเลย ถ้าราคาไม่ถึง\n\n💡 **แนะนำสำหรับมือใหม่:** ใช้ Limit Order เพื่อควบคุมราคาที่จ่าย',
            },
            {
                heading: 'Stop Order (คำสั่งหยุดขาดทุน)',
                content: '**Stop Order** = สั่งขายอัตโนมัติเมื่อราคาลดลงถึงจุดที่กำหนด\n\n**Stop Loss:** ป้องกันขาดทุน\nตัวอย่าง: ซื้อ AAPL $200 → ตั้ง Stop Loss $180 → ถ้าราคาลงถึง $180 จะขายอัตโนมัติ\n\n**Stop Limit:** เหมือน Stop Order แต่เมื่อถึงราคาจะกลายเป็น Limit Order\nตัวอย่าง: Stop $180, Limit $178 → เมื่อราคาถึง $180 จะตั้งขายที่ $178+\n\n**Trailing Stop:** ขยับตามราคาที่ขึ้น\nตัวอย่าง: Trailing Stop 10% → ซื้อ $200 ราคาขึ้น $250 → Stop อยู่ที่ $225\n\n💡 **สำคัญมาก:** ตั้ง Stop Loss ทุกครั้งที่ซื้อหุ้น เพื่อจำกัดการขาดทุน',
            },
            {
                heading: 'Day Order vs GTC',
                content: '**ระยะเวลาของคำสั่ง:**\n\n**Day Order:**\n- คำสั่งมีผลแค่ **วันเดียว**\n- ถ้าสิ้นวันยังไม่ถูก execute จะถูกยกเลิกอัตโนมัติ\n- เหมาะกับ: เทรดรายวัน\n\n**GTC (Good Till Cancelled):**\n- คำสั่งมีผลจนกว่าจะถูก execute หรือ **คุณยกเลิกเอง**\n- ส่วนใหญ่มีอายุสูงสุด 60-90 วัน\n- เหมาะกับ: ตั้งราคาเป้าหมายรอไว้\n\n**สรุปคำสั่งที่มือใหม่ควรรู้:**\n\n| คำสั่ง | ใช้เมื่อ |\n|--------|----------|\n| Market | ต้องการซื้อ/ขายทันที |\n| Limit | ต้องการกำหนดราคา |\n| Stop Loss | ต้องการจำกัดขาดทุน |\n| GTC | ต้องการรอราคาเป้าหมาย |',
            },
        ],
        keyTakeaways: [
            'Market Order = ซื้อ/ขายทันที ณ ราคาตลาด',
            'Limit Order = ซื้อ/ขายที่ราคาที่กำหนดเท่านั้น',
            'Stop Loss = ขายอัตโนมัติเพื่อจำกัดขาดทุน',
            'มือใหม่ควรใช้ Limit Order + Stop Loss เสมอ',
        ],
        quiz: [
            { question: 'Limit Order คืออะไร?', options: ['ซื้อทันทีในราคาตลาด', 'ซื้อ/ขายที่ราคาที่กำหนดไว้', 'ยกเลิกคำสั่งอัตโนมัติ', 'ซื้อจำนวนจำกัด'], answer: 1 },
            { question: 'GTC ย่อมาจากอะไร?', options: ['Get The Cash', 'Good Till Cancelled', 'Go To Close', 'Gain Through Compound'], answer: 1 },
        ],
    },
    {
        id: 'stock-indices',
        title: 'ดัชนีหุ้นคืออะไร?',
        titleEn: 'What Are Stock Indices?',
        description: 'รู้จัก S&P 500, Dow Jones, NASDAQ และทำไมดัชนีสำคัญสำหรับนักลงทุนทุกคน',
        category: 'fundamentals',
        module: 1,
        order: 4,
        difficulty: 'beginner',
        duration: 8,
        icon: '📊',
        thumbnail: 'https://images.unsplash.com/photo-1535320903710-d946a44a5642?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ดัชนีหุ้นคืออะไร?',
                content: '**ดัชนีหุ้น (Stock Index)** คือตัวเลขที่วัดผลรวมของหุ้นกลุ่มหนึ่ง ใช้บอกว่า "ตลาดโดยรวมเป็นยังไง"\n\nเปรียบเหมือน **เทอร์โมมิเตอร์วัดสุขภาพตลาด:**\n- ดัชนีขึ้น 📈 = ตลาดโดยรวมดี หุ้นส่วนใหญ่ขึ้น\n- ดัชนีลง 📉 = ตลาดโดยรวมแย่ หุ้นส่วนใหญ่ลง\n\n💡 เวลาข่าวบอกว่า "ตลาดหุ้นวันนี้ขึ้น 1%" หมายถึงดัชนีขึ้น ไม่ได้หมายความว่าทุกหุ้นขึ้น',
            },
            {
                heading: 'ดัชนีสำคัญของสหรัฐ',
                content: '**🏆 S&P 500:**\n- หุ้น 500 บริษัทใหญ่ที่สุดในสหรัฐ\n- เป็น "มาตรฐาน" ที่ใช้วัดตลาดมากที่สุด\n- ผลตอบแทนเฉลี่ย ~10%/ปี (ย้อนหลัง 50+ ปี)\n- ตัวอย่าง: AAPL, MSFT, GOOGL, AMZN, NVDA\n\n**📈 Dow Jones Industrial Average (DJIA):**\n- หุ้น 30 บริษัทชั้นนำ Blue-Chip\n- ดัชนีที่เก่าแก่ที่สุด (เริ่มปี 1896)\n- ตัวอย่าง: AAPL, MSFT, JPM, JNJ, V\n\n**💻 NASDAQ Composite:**\n- หุ้นทั้งหมดในตลาด NASDAQ (~3,000+ บริษัท)\n- เน้นหุ้นเทคโนโลยี\n- NASDAQ-100 = 100 บริษัทใหญ่สุดที่ไม่ใช่การเงิน',
            },
            {
                heading: 'ดัชนีหุ้นไทยและดัชนีอื่นๆ',
                content: '**🇹🇭 ดัชนีหุ้นไทย:**\n- **SET Index** — ดัชนีหลักของตลาดหุ้นไทย\n- **SET50** — 50 หุ้นใหญ่ที่สุดในตลาดไทย\n- **SET100** — 100 หุ้นใหญ่ที่สุด\n- **mai Index** — ดัชนีตลาดหุ้นขนาดกลาง-เล็ก\n\n**🌍 ดัชนีสำคัญอื่นๆ:**\n- **Nikkei 225** — ญี่ปุ่น\n- **FTSE 100** — อังกฤษ\n- **DAX** — เยอรมนี\n- **Hang Seng** — ฮ่องกง\n- **Shanghai Composite** — จีน',
            },
            {
                heading: 'ทำไมต้องดูดัชนี?',
                content: '**1. วัดสุขภาพตลาดโดยรวม:**\n- ถ้า S&P 500 ลง 2% แต่หุ้นคุณลงแค่ 0.5% → หุ้นคุณแข็งแกร่งกว่าตลาด\n\n**2. เปรียบเทียบผลงานของคุณ (Benchmark):**\n- ถ้าพอร์ตคุณได้ 8%/ปี แต่ S&P 500 ได้ 12% → คุณแพ้ตลาด\n- ถ้าได้ 15% → คุณชนะตลาด! 🎉\n\n**3. ลงทุนผ่านกองทุนดัชนี (Index Fund):**\n- ซื้อ SPY หรือ VOO = ลงทุนใน S&P 500 ทั้ง 500 หุ้น\n- ซื้อ QQQ = ลงทุนใน NASDAQ-100\n- วิธีง่ายที่สุดในการเริ่มต้นลงทุน!\n\n💡 Warren Buffett แนะนำให้คนทั่วไปลงทุนในกองทุนดัชนี S&P 500',
            },
        ],
        keyTakeaways: [
            'ดัชนีหุ้นวัดผลรวมของหุ้นกลุ่มหนึ่ง ใช้วัดสุขภาพตลาด',
            'S&P 500 = 500 หุ้นใหญ่สุด เป็นมาตรฐานของตลาดสหรัฐ',
            'ใช้ดัชนีเป็น Benchmark เปรียบเทียบผลงานพอร์ต',
            'ลงทุนในกองทุนดัชนี (SPY, VOO, QQQ) เป็นวิธีเริ่มต้นที่ง่ายที่สุด',
        ],
        quiz: [
            { question: 'S&P 500 ประกอบด้วยหุ้นกี่บริษัท?', options: ['50', '100', '500', '1,000'], answer: 2 },
            { question: 'SPY คืออะไร?', options: ['แอปซื้อขายหุ้น', 'กองทุนดัชนี S&P 500', 'ดัชนีหุ้นไทย', 'บริษัทเทคโนโลยี'], answer: 1 },
        ],
    },
    {
    // ═══════════════════════════════════
    // Module 3: Investment Tools
    // ═══════════════════════════════════
        id: 'etf-and-funds',
        title: 'ETF และกองทุนรวมคืออะไร?',
        titleEn: 'ETFs & Mutual Funds',
        description: 'รู้จัก ETF กองทุนรวม ต่างกันยังไง? เหมาะกับใคร? และ ETF ยอดนิยมที่มือใหม่ควรรู้',
        category: 'tools',
        module: 3,
        order: 9,
        difficulty: 'beginner',
        duration: 12,
        icon: '🧩',
        thumbnail: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ba58?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ETF คืออะไร?',
                content: '**ETF (Exchange-Traded Fund)** คือกองทุนที่ซื้อขายในตลาดหุ้นได้เหมือนหุ้นทั่วไป\n\n**เปรียบเทียบง่ายๆ:**\n- ซื้อหุ้น AAPL = ซื้อแอปเปิ้ล **1 ลูก**\n- ซื้อ ETF อย่าง SPY = ซื้อ **ตะกร้าผลไม้** ที่มีแอปเปิ้ล 500 ลูก!\n\nเมื่อซื้อ ETF 1 หน่วย คุณจะได้ถือหุ้นหลายบริษัทพร้อมกัน โดยไม่ต้องซื้อทีละตัว\n\n**ข้อดี:**\n- ✅ กระจายความเสี่ยงอัตโนมัติ\n- ✅ ซื้อขายง่ายเหมือนหุ้น\n- ✅ ค่าธรรมเนียมต่ำมาก (0.03-0.20%/ปี)\n- ✅ เหมาะมือใหม่มากที่สุด',
            },
            {
                heading: 'ETF ยอดนิยมที่มือใหม่ควรรู้',
                content: '**📈 กองทุนดัชนี:**\n- **SPY / VOO** — S&P 500 (500 หุ้นใหญ่สุดในสหรัฐ)\n- **QQQ** — NASDAQ-100 (เน้นเทคโนโลยี)\n- **VTI** — ตลาดหุ้นสหรัฐทั้งหมด\n- **VXUS** — หุ้นนอกสหรัฐทั่วโลก\n\n**💰 กองทุนปันผล:**\n- **VYM** — หุ้นปันผลสูง\n- **SCHD** — หุ้นปันผลเติบโต\n\n**🏢 กองทุนเฉพาะกลุ่ม:**\n- **XLK** — เทคโนโลยี\n- **XLF** — การเงิน\n- **XLV** — สุขภาพ\n\n💡 เริ่มต้นด้วย **VOO + QQQ** ก็เพียงพอสำหรับมือใหม่',
            },
            {
                heading: 'กองทุนรวม (Mutual Fund) คืออะไร?',
                content: '**กองทุนรวม** คล้าย ETF แต่มีข้อแตกต่าง:\n\n| | ETF | กองทุนรวม |\n|---|-----|----------|\n| ซื้อขาย | ตลอดวัน เหมือนหุ้น | วันละ 1 ครั้ง (NAV สิ้นวัน) |\n| ราคาขั้นต่ำ | ราคา 1 หน่วย ($100-500) | อาจกำหนดขั้นต่ำ $1,000+ |\n| ค่าธรรมเนียม | ต่ำมาก (0.03-0.20%) | สูงกว่า (0.50-1.50%) |\n| ภาษี | ประหยัดกว่า | อาจเสียภาษีมากกว่า |\n| ความยืดหยุ่น | สูง | น้อยกว่า |\n\n**กองทุนรวมในไทย:**\n- KFLTFDIV, SCBSET, BBLAM, K-USA — กองทุนหุ้นยอดนิยมในไทย\n- ลงทุนได้ผ่านแอปธนาคาร',
            },
            {
                heading: 'ETF vs หุ้นรายตัว — เลือกอะไรดี?',
                content: '**เลือก ETF ถ้า:**\n- 🟢 เพิ่งเริ่มต้น ยังไม่รู้จะเลือกหุ้นตัวไหน\n- 🟢 ไม่มีเวลาวิเคราะห์หุ้นรายตัว\n- 🟢 ต้องการกระจายความเสี่ยง\n- 🟢 ลงทุนแบบ DCA ระยะยาว\n\n**เลือกหุ้นรายตัว ถ้า:**\n- 🟡 พร้อมทำการบ้าน วิเคราะห์งบการเงิน\n- 🟡 มั่นใจในบริษัทที่เลือก\n- 🟡 ต้องการผลตอบแทนสูงกว่าตลาด\n\n**คำแนะนำ:**\n- เริ่มต้น 70% ETF + 30% หุ้นรายตัวที่เข้าใจ\n- ค่อยๆ เพิ่มสัดส่วนหุ้นรายตัวเมื่อมีความมั่นใจมากขึ้น',
            },
        ],
        keyTakeaways: [
            'ETF = กองทุนที่ซื้อขายได้เหมือนหุ้น กระจายความเสี่ยงอัตโนมัติ',
            'VOO / SPY = ลงทุนใน S&P 500 ทั้ง 500 หุ้น',
            'ETF ค่าธรรมเนียมต่ำกว่ากองทุนรวม',
            'มือใหม่เริ่มด้วย ETF + หุ้นรายตัวเล็กน้อย',
        ],
        quiz: [
            { question: 'ETF ย่อมาจากอะไร?', options: ['Electronic Transfer Fund', 'Exchange-Traded Fund', 'Equity Trading Fee', 'External Tax Form'], answer: 1 },
            { question: 'VOO คืออะไร?', options: ['หุ้นบริษัท Voo', 'กองทุนดัชนี S&P 500', 'แอปซื้อขายหุ้น', 'สกุลเงินดิจิทัล'], answer: 1 },
        ],
    },
    {
        id: 'reading-stock-charts',
        title: 'อ่านกราฟหุ้นเบื้องต้น',
        titleEn: 'Reading Stock Charts for Beginners',
        description: 'เข้าใจกราฟแท่งเทียน กราฟเส้น Volume bars และ Timeframe สำหรับมือใหม่',
        category: 'tools',
        module: 3,
        order: 10,
        difficulty: 'beginner',
        duration: 10,
        icon: '📉',
        thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'กราฟเส้น (Line Chart)',
                content: '**กราฟเส้น** เป็นกราฟแบบง่ายที่สุด แสดงราคาปิดของหุ้นเชื่อมต่อกันเป็นเส้น\n\n**อ่านยังไง:**\n- แกน X (แนวนอน) = วันที่/เวลา\n- แกน Y (แนวตั้ง) = ราคาหุ้น\n- เส้นขึ้น 📈 = ราคาเพิ่มขึ้น\n- เส้นลง 📉 = ราคาลดลง\n\n**ข้อดี:** ดูง่าย เห็นแนวโน้มชัดเจน\n**ข้อเสีย:** ไม่เห็นรายละเอียด (ราคาเปิด, สูงสุด, ต่ำสุด)\n\n💡 กราฟเส้นเหมาะสำหรับดูภาพรวมแนวโน้มระยะยาว',
            },
            {
                heading: 'กราฟแท่งเทียน (Candlestick Chart)',
                content: '**กราฟแท่งเทียน** แสดงข้อมูลมากกว่ากราฟเส้น:\n\nแต่ละแท่งบอก 4 อย่าง:\n- **Open** — ราคาเปิด (จุดเริ่มต้นของแท่ง)\n- **Close** — ราคาปิด (จุดสิ้นสุดของแท่ง)\n- **High** — ราคาสูงสุด (ปลายไส้เทียนด้านบน)\n- **Low** — ราคาต่ำสุด (ปลายไส้เทียนด้านล่าง)\n\n**สี:**\n- 🟢 **แท่งเขียว/กลวง** = Close > Open (ราคาขึ้น)\n- 🔴 **แท่งแดง/ทึบ** = Close < Open (ราคาลง)\n\n**ตัวแท่ง (Body)** = ช่วงราคา Open ถึง Close\n**ไส้เทียน (Wick/Shadow)** = ช่วง High และ Low',
            },
            {
                heading: 'Volume คืออะไร?',
                content: '**Volume** = จำนวนหุ้นที่ถูกซื้อขายในช่วงเวลานั้น\n\n**แสดงเป็นแท่ง** อยู่ด้านล่างกราฟราคา:\n- แท่ง Volume สูง = มีคนซื้อขายเยอะ\n- แท่ง Volume ต่ำ = มีคนซื้อขายน้อย\n\n**ทำไม Volume สำคัญ?**\n\n1. **ยืนยันแนวโน้ม:**\n   - ราคาขึ้น + Volume สูง = ขาขึ้นแข็งแกร่ง ✅\n   - ราคาขึ้น + Volume ต่ำ = ขาขึ้นอ่อนแอ ⚠️\n\n2. **บ่งบอกจุดกลับตัว:**\n   - Volume พุ่งสูงผิดปกติ = อาจมีเหตุการณ์สำคัญ\n\n3. **วัดสภาพคล่อง:**\n   - Volume สูง = ซื้อขายง่าย Spread แคบ',
            },
            {
                heading: 'Timeframe (กรอบเวลา)',
                content: '**Timeframe** คือระยะเวลาที่แต่ละแท่งเทียนแทน:\n\n| Timeframe | แต่ละแท่ง = | เหมาะกับ |\n|-----------|------------|----------|\n| 1 นาที | 1 นาที | Day Trader |\n| 5 นาที | 5 นาที | Day Trader |\n| 1 ชั่วโมง | 1 ชั่วโมง | Swing Trader |\n| 1 วัน (Daily) | 1 วัน | นักลงทุนทั่วไป |\n| 1 สัปดาห์ (Weekly) | 1 สัปดาห์ | นักลงทุนระยะยาว |\n| 1 เดือน (Monthly) | 1 เดือน | ดูภาพรวมใหญ่ |\n\n**แนะนำสำหรับมือใหม่:**\n- ใช้ **Daily** สำหรับดูรายละเอียด\n- ใช้ **Weekly/Monthly** สำหรับดูแนวโน้มใหญ่\n- ❌ อย่าไปดูกราฟ 1 นาที จะเครียดและตัดสินใจผิด!',
            },
        ],
        keyTakeaways: [
            'กราฟเส้น = ดูง่าย เห็นแนวโน้มชัด',
            'แท่งเทียน = เขียว (ขึ้น), แดง (ลง), แสดง Open/Close/High/Low',
            'Volume สูง + ราคาขึ้น = สัญญาณที่ดี',
            'มือใหม่ใช้ Daily/Weekly chart อย่าดูกราฟสั้นเกินไป',
        ],
        quiz: [
            { question: 'แท่งเทียนสีเขียวหมายถึง?', options: ['ราคาลง', 'ราคาปิดสูงกว่าราคาเปิด', 'Volume สูง', 'หุ้นน่าซื้อ'], answer: 1 },
            { question: 'Volume สูง + ราคาขึ้น หมายถึง?', options: ['ขาขึ้นอ่อนแอ', 'ขาขึ้นแข็งแกร่ง', 'ตลาดจะลง', 'ควรขายทันที'], answer: 1 },
        ],
    },
    {
        id: 'investment-terms',
        title: 'คำศัพท์การลงทุนที่ต้องรู้',
        titleEn: 'Must-Know Investment Terms',
        description: 'รวมคำศัพท์สำคัญที่มือใหม่ต้องเข้าใจ: Bull/Bear, Long/Short, Margin, Earnings และอื่นๆ',
        category: 'getting-started',
        module: 2,
        order: 8,
        difficulty: 'beginner',
        duration: 15,
        icon: '📖',
        thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Bull Market / Bear Market',
                content: '**🐂 Bull Market (ตลาดกระทิง):**\n- ตลาดขาขึ้น ราคาหุ้นเพิ่มขึ้นต่อเนื่อง (20%+)\n- นักลงทุนมีความมั่นใจ อยากซื้อ\n- เศรษฐกิจมักจะดี\n\n**🐻 Bear Market (ตลาดหมี):**\n- ตลาดขาลง ราคาหุ้นลดลงต่อเนื่อง (20%+)\n- นักลงทุนกลัว อยากขาย\n- เศรษฐกิจมักจะชะลอตัว\n\n**คำที่เกี่ยวข้อง:**\n- **Bullish** = มองว่าราคาจะขึ้น (เป็นบวก)\n- **Bearish** = มองว่าราคาจะลง (เป็นลบ)\n- **Correction** = ตลาดลง 10-20% (ปรับฐาน)\n- **Crash** = ตลาดลงเร็วและแรงมาก (>20% ในเวลาสั้น)',
            },
            {
                heading: 'Long / Short',
                content: '**📈 Long (ซื้อก่อน):**\n- ซื้อหุ้นเพราะคิดว่าราคาจะ **ขึ้น**\n- "ซื้อถูก ขายแพง"\n- ตัวอย่าง: ซื้อ AAPL $200 → ขาย $250 → กำไร $50\n- นี่คือวิธีที่คนส่วนใหญ่ลงทุน\n\n**📉 Short Selling (ขายก่อน):**\n- ยืมหุ้นมาขายก่อน เพราะคิดว่าราคาจะ **ลง**\n- "ขายแพง ซื้อคืนถูก"\n- ตัวอย่าง: Short TSLA $300 → ซื้อคืน $200 → กำไร $100\n\n**⚠️ Short Selling เสี่ยงมาก:**\n- ขาดทุนได้ไม่จำกัด (ราคาขึ้นได้ไม่มีเพดาน)\n- ❌ **ไม่แนะนำสำหรับมือใหม่เด็ดขาด**\n- ต้องมี Margin Account',
            },
            {
                heading: 'Margin / Leverage',
                content: '**Margin** = การกู้เงินจากโบรกเกอร์เพื่อซื้อหุ้น\n\nตัวอย่าง: มีเงิน $10,000 ใช้ Margin 2x\n→ ซื้อหุ้นได้ $20,000\n→ ถ้าหุ้นขึ้น 10% = กำไร $2,000 (20% ของเงินต้น) 🎉\n→ ถ้าหุ้นลง 10% = ขาดทุน $2,000 (20% ของเงินต้น) 😱\n\n**Leverage** = ตัวคูณ (2x, 3x, 5x...)\n- ยิ่ง Leverage สูง ยิ่งเสี่ยง\n\n**Margin Call:**\n- เมื่อหุ้นลงมาก โบรกเกอร์จะ "เรียก Margin" บังคับให้เติมเงินหรือขายหุ้น\n\n🚫 **กฎเหล็ก:** มือใหม่ห้ามใช้ Margin เด็ดขาด! ลงทุนด้วยเงินที่มีเท่านั้น',
            },
            {
                heading: 'คำศัพท์สำคัญอื่นๆ',
                content: '**เกี่ยวกับผลประกอบการ:**\n- **Earnings** = รายงานผลกำไร/ขาดทุนของบริษัท (ออกทุกไตรมาส)\n- **EPS** = กำไรต่อหุ้น (Earnings Per Share)\n- **Revenue** = รายได้ทั้งหมดของบริษัท\n- **Profit Margin** = อัตรากำไรสุทธิ\n\n**เกี่ยวกับเงินปันผล:**\n- **Dividend** = เงินที่บริษัทจ่ายให้ผู้ถือหุ้น\n- **Dividend Yield** = เงินปันผลต่อปี ÷ ราคาหุ้น\n- **Ex-Dividend Date** = วันที่ต้องถือหุ้นก่อนวันนี้ถึงจะได้ปันผล\n\n**เกี่ยวกับตลาด:**\n- **Volatility** = ความผันผวนของราคา\n- **Liquidity** = สภาพคล่อง (ซื้อขายง่ายแค่ไหน)\n- **Portfolio** = พอร์ตการลงทุน (หุ้นทั้งหมดที่ถือ)\n- **Benchmark** = มาตรฐานเปรียบเทียบ (เช่น S&P 500)',
            },
        ],
        keyTakeaways: [
            'Bull = ขาขึ้น, Bear = ขาลง',
            'Long = ซื้อก่อน (ราคาขึ้นกำไร), Short = ขายก่อน (ราคาลงกำไร)',
            'Margin = กู้เงินซื้อหุ้น — มือใหม่ห้ามใช้!',
            'EPS, Dividend Yield, Volatility เป็นคำที่ต้องเข้าใจ',
        ],
        quiz: [
            { question: 'Bear Market คืออะไร?', options: ['ตลาดขึ้นมากกว่า 20%', 'ตลาดลงมากกว่า 20%', 'ตลาดปิดทำการ', 'ตลาดเปิดใหม่'], answer: 1 },
            { question: 'Margin Call คืออะไร?', options: ['โทรศัพท์จากโบรกเกอร์เชิญลงทุน', 'บังคับเติมเงินหรือขายหุ้นเมื่อขาดทุนมาก', 'คำสั่งซื้อหุ้นพิเศษ', 'ค่าธรรมเนียมรายเดือน'], answer: 1 },
            { question: 'Ex-Dividend Date สำคัญอย่างไร?', options: ['วันที่หุ้นเริ่มซื้อขาย', 'ต้องถือหุ้นก่อนวันนี้ถึงจะได้ปันผล', 'วันที่บริษัทประกาศงบ', 'วันที่ตลาดปิด'], answer: 1 },
        ],
    },

    // ═══════════════════════════════════
    // Module 4: Fundamental Analysis
    // ═══════════════════════════════════
    {
        id: 'pe-ratio',
        title: 'PE Ratio คืออะไร?',
        titleEn: 'Understanding PE Ratio',
        description: 'เข้าใจ PE Ratio ตัวเลขสำคัญที่สุดในการประเมินมูลค่าหุ้น',
        category: 'fundamental-analysis',
        module: 4,
        order: 11,
        difficulty: 'beginner',
        duration: 10,
        icon: '🔢',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'PE Ratio คืออะไร?',
                content: '**PE Ratio (Price-to-Earnings Ratio)** = ราคาหุ้น ÷ กำไรต่อหุ้น (EPS)\n\nตัวอย่าง: Apple ราคา $200, EPS = $8\nPE Ratio = 200 ÷ 8 = **25 เท่า**\n\nหมายความว่า คุณจ่ายเงิน 25 เท่าของกำไรต่อปี เพื่อซื้อหุ้น Apple',
            },
            {
                heading: 'PE สูง vs PE ต่ำ',
                content: '**PE สูง (>25):**\n- ตลาดคาดว่าบริษัทจะเติบโตมาก\n- หุ้น Growth มักมี PE สูง (เช่น NVDA PE ~60)\n- ⚠️ อาจ "แพงไป" ถ้าการเติบโตไม่เป็นไปตามคาด\n\n**PE ต่ำ (<15):**\n- หุ้นราคาถูกเมื่อเทียบกับกำไร\n- อาจเป็นหุ้น Value ที่น่าสนใจ\n- ⚠️ อาจถูกเพราะบริษัทมีปัญหา\n\n**PE เหมาะสม:**\n- เปรียบเทียบกับ PE เฉลี่ยของอุตสาหกรรมเดียวกัน\n- S&P 500 ค่าเฉลี่ยอยู่ที่ประมาณ 20-25',
            },
            {
                heading: 'ข้อจำกัดของ PE Ratio',
                content: '- ใช้ไม่ได้กับบริษัทที่ **ขาดทุน** (PE เป็นลบไม่มีความหมาย)\n- ไม่ได้บอกว่าบริษัท **เติบโต** เร็วแค่ไหน → ใช้ PEG Ratio แทน\n- PE อาจ **บิดเบือน** จากรายการพิเศษ (เช่น ขายสินทรัพย์)\n\n💡 **PEG Ratio** = PE ÷ อัตราการเติบโตของกำไร\nPEG < 1 = หุ้นถูก, PEG > 2 = หุ้นแพง',
            },
        ],
        keyTakeaways: [
            'PE Ratio = ราคาหุ้น ÷ EPS',
            'PE สูง = ตลาดคาดหวังการเติบโตสูง',
            'เปรียบเทียบ PE กับบริษัทในอุตสาหกรรมเดียวกัน',
            'ใช้ PEG Ratio เพิ่มเติมเพื่อพิจารณาการเติบโต',
        ],
        quiz: [
            { question: 'PE Ratio คำนวณอย่างไร?', options: ['ราคาหุ้น × EPS', 'ราคาหุ้น ÷ EPS', 'EPS ÷ ราคาหุ้น', 'กำไร ÷ รายได้'], answer: 1 },
            { question: 'หุ้น Growth มักมี PE Ratio แบบไหน?', options: ['ต่ำมาก (<10)', 'ปานกลาง (15-20)', 'สูง (>25)', 'เป็นลบ'], answer: 2 },
        ],
    },
    {
        id: 'reading-financial-statements',
        title: 'อ่านงบการเงินเบื้องต้น',
        titleEn: 'Reading Financial Statements',
        description: 'เข้าใจงบกำไรขาดทุน งบดุล และงบกระแสเงินสด อย่างง่าย',
        category: 'fundamental-analysis',
        module: 4,
        order: 12,
        difficulty: 'intermediate',
        duration: 15,
        icon: '📋',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'งบกำไรขาดทุน (Income Statement)',
                content: 'บอกว่าบริษัท **ทำเงินได้เท่าไหร่** ในช่วงเวลาหนึ่ง:\n\n1. **Revenue (รายได้)** — เงินที่ได้จากการขายสินค้า/บริการ\n2. **Cost of Revenue** — ต้นทุนการผลิต\n3. **Gross Profit** = Revenue - Cost = กำไรขั้นต้น\n4. **Operating Expenses** — ค่าใช้จ่ายในการดำเนินงาน\n5. **Net Income (กำไรสุทธิ)** — กำไรจริงๆ หลังหักค่าใช้จ่ายและภาษีทั้งหมด\n\n💡 ดู **Profit Margin** = Net Income ÷ Revenue → ยิ่งสูงยิ่งดี',
            },
            {
                heading: 'งบดุล (Balance Sheet)',
                content: 'บอกว่าบริษัท **มีอะไรบ้าง** ณ จุดเวลาหนึ่ง:\n\n**สินทรัพย์ (Assets)** = **หนี้สิน (Liabilities)** + **ส่วนของผู้ถือหุ้น (Equity)**\n\n- **Current Assets** — สินทรัพย์ที่เปลี่ยนเป็นเงินได้ใน 1 ปี (เงินสด, ลูกหนี้)\n- **Non-Current Assets** — สินทรัพย์ระยะยาว (โรงงาน, เครื่องจักร)\n- **Current Liabilities** — หนี้ที่ต้องจ่ายใน 1 ปี\n- **Total Equity** — มูลค่าของบริษัทที่เป็นของผู้ถือหุ้น\n\n💡 ดู **Debt-to-Equity** = หนี้สิน ÷ ส่วนผู้ถือหุ้น → ยิ่งต่ำยิ่งดี',
            },
            {
                heading: 'งบกระแสเงินสด (Cash Flow Statement)',
                content: 'บอกว่า **เงินสดไหลเข้าออก** อย่างไร:\n\n1. **Operating Cash Flow** — เงินสดจากการดำเนินธุรกิจหลัก (ควรเป็นบวก!)\n2. **Investing Cash Flow** — เงินที่ใช้ลงทุน (ซื้อเครื่องจักร, R&D) (มักเป็นลบ)\n3. **Financing Cash Flow** — เงินจากการกู้/จ่ายหนี้/ออกหุ้น\n\n💡 **Free Cash Flow** = Operating - Capital Expenditure → เงินที่เหลือจริงๆ',
            },
        ],
        keyTakeaways: [
            'Income Statement → บอกว่าทำเงินได้เท่าไหร่',
            'Balance Sheet → บอกว่ามีอะไร เป็นหนี้เท่าไหร่',
            'Cash Flow → บอกว่าเงินสดไหลเข้าออกอย่างไร',
            'ดู Profit Margin, Debt-to-Equity, Free Cash Flow',
        ],
    },
    {
    // ═══════════════════════════════════
    // Module 5: Technical Analysis
    // ═══════════════════════════════════
        id: 'technical-analysis-basics',
        title: 'เทคนิคอลเบื้องต้น',
        titleEn: 'Technical Analysis Basics',
        description: 'เข้าใจกราฟหุ้น, Moving Average, RSI และ MACD สำหรับมือใหม่',
        category: 'technical-analysis',
        module: 5,
        order: 14,
        difficulty: 'intermediate',
        duration: 12,
        icon: '📉',
        thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'เทคนิคอลคืออะไร?',
                content: 'การวิเคราะห์ทางเทคนิค (Technical Analysis) คือการ **ดูกราฟราคาและ Volume** เพื่อคาดการณ์ทิศทางราคาในอนาคต\n\n**แนวคิดหลัก:**\n- ราคาสะท้อนทุกอย่างแล้ว\n- ราคามีแนวโน้ม (Trend)\n- ประวัติซ้ำรอย\n\n⚠️ เทคนิคอลไม่ได้แม่นยำ 100% ควรใช้ร่วมกับปัจจัยพื้นฐาน',
            },
            {
                heading: 'Moving Average (MA)',
                content: '**Moving Average** = ค่าเฉลี่ยราคาย้อนหลัง\n\n- **MA50** — ค่าเฉลี่ย 50 วัน (แนวโน้มระยะสั้น)\n- **MA200** — ค่าเฉลี่ย 200 วัน (แนวโน้มระยะยาว)\n\n**สัญญาณ:**\n- ราคา **อยู่เหนือ** MA = แนวโน้มขาขึ้น ✅\n- ราคา **อยู่ใต้** MA = แนวโน้มขาลง ⛔\n- **Golden Cross** = MA50 ตัด MA200 ขึ้น → สัญญาณซื้อ\n- **Death Cross** = MA50 ตัด MA200 ลง → สัญญาณขาย',
            },
            {
                heading: 'RSI (Relative Strength Index)',
                content: '**RSI** วัดว่าหุ้น "ซื้อมากเกินไป" หรือ "ขายมากเกินไป"\n\n**ค่า RSI อยู่ระหว่าง 0-100:**\n- RSI > 70 = **Overbought** (ซื้อมากเกินไป อาจลงเร็วๆ นี้) 🔴\n- RSI < 30 = **Oversold** (ขายมากเกินไป อาจขึ้นเร็วๆ นี้) 🟢\n- RSI 30-70 = ปกติ\n\n💡 RSI ไม่ได้หมายความว่าราคาจะกลับตัวทันที อาจ Overbought ได้นานในช่วงตลาดขาขึ้น',
            },
            {
                heading: 'MACD',
                content: '**MACD (Moving Average Convergence Divergence)** ช่วยดู **จังหวะ** ของแนวโน้ม:\n\n- **MACD Line** = EMA12 - EMA26\n- **Signal Line** = EMA9 ของ MACD Line\n\n**สัญญาณ:**\n- MACD ตัด Signal Line **ขึ้น** = Bullish (สัญญาณซื้อ) 🟢\n- MACD ตัด Signal Line **ลง** = Bearish (สัญญาณขาย) 🔴\n- **Histogram** แสดงความแรงของสัญญาณ',
            },
        ],
        keyTakeaways: [
            'MA50 > MA200 = Golden Cross (สัญญาณซื้อ)',
            'RSI > 70 = Overbought, RSI < 30 = Oversold',
            'MACD ช่วยจับจังหวะเข้าออก',
            'ใช้เทคนิคอลร่วมกับปัจจัยพื้นฐานเสมอ',
        ],
    },
    {
        id: 'fundamental-vs-technical',
        title: 'ปัจจัยพื้นฐาน vs เทคนิคอล',
        titleEn: 'Fundamental vs Technical Analysis',
        description: 'เปรียบเทียบสองแนวทางการวิเคราะห์ และเมื่อไหร่ควรใช้อันไหน',
        category: 'technical-analysis',
        module: 5,
        order: 15,
        difficulty: 'intermediate',
        duration: 8,
        icon: '⚖️',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ปัจจัยพื้นฐาน (Fundamental Analysis)',
                content: '**ดูที่ "ตัวบริษัท"** — ธุรกิจดีไหม? ทำเงินได้ไหม? เติบโตไหม?\n\n**เครื่องมือ:**\n- PE, PB, EPS, ROE\n- งบการเงิน (Income, Balance, Cash Flow)\n- ข่าวบริษัท, ผลิตภัณฑ์ใหม่, ผู้บริหาร\n\n**เหมาะกับ:** ลงทุนระยะยาว (เดือน-ปี)',
            },
            {
                heading: 'เทคนิคอล (Technical Analysis)',
                content: '**ดูที่ "กราฟราคา"** — ราคาจะไปทางไหน? เมื่อไหร่ควรซื้อ/ขาย?\n\n**เครื่องมือ:**\n- Moving Average, RSI, MACD\n- แนวรับ/แนวต้าน\n- รูปแบบกราฟ (Chart Patterns)\n\n**เหมาะกับ:** เทรดระยะสั้น (วัน-สัปดาห์)',
            },
            {
                heading: 'ใช้ทั้งสองร่วมกัน',
                content: '**แนวทางที่ดีที่สุด:**\n\n1. ใช้ **ปัจจัยพื้นฐาน** เลือกบริษัทที่ดี\n2. ใช้ **เทคนิคอล** หาจังหวะซื้อที่เหมาะสม\n\nตัวอย่าง:\n- วิเคราะห์ว่า Apple เป็นบริษัทดี (Fundamental ✅)\n- รอซื้อตอน RSI < 30 หรือราคาแตะ MA200 (Technical ✅)\n\n💡 ใน FinLearn คุณจะเห็นทั้งข้อมูลพื้นฐานและเทคนิคอลในหน้าเดียวกัน',
            },
        ],
        keyTakeaways: [
            'Fundamental = ดูตัวบริษัท เหมาะลงทุนระยะยาว',
            'Technical = ดูกราฟ เหมาะเทรดระยะสั้น',
            'ใช้ทั้งสองร่วมกันให้ผลลัพธ์ดีที่สุด',
        ],
    },
    {
        id: 'valuation-models',
        title: 'การประเมินมูลค่าหุ้นขั้นสูง',
        titleEn: 'Advanced Stock Valuation',
        description: 'เรียนรู้โมเดล DCF, Comparable Analysis และ Sum-of-the-Parts สำหรับประเมินมูลค่าที่แท้จริงของหุ้น',
        category: 'fundamental-analysis',
        module: 4,
        order: 13,
        difficulty: 'advanced',
        duration: 20,
        icon: '🧮',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Intrinsic Value คืออะไร?',
                content: '**Intrinsic Value (มูลค่าที่แท้จริง)** คือราคาที่หุ้นควรจะเป็น ตามพื้นฐานของบริษัท\n\n**หลักการ:**\n- ถ้า Intrinsic Value > ราคาตลาด → หุ้น **Undervalued** (น่าซื้อ)\n- ถ้า Intrinsic Value < ราคาตลาด → หุ้น **Overvalued** (แพงไป)\n\n**Margin of Safety:**\n- Benjamin Graham (อาจารย์ของ Warren Buffett) แนะนำ: ซื้อเมื่อราคาต่ำกว่า Intrinsic Value อย่างน้อย **20-30%**\n- เป็น "เบาะนิรภัย" ป้องกันกรณีวิเคราะห์ผิด\n\n**3 โมเดลหลักในการหา Intrinsic Value:**\n1. DCF (Discounted Cash Flow)\n2. Comparable Analysis\n3. Sum-of-the-Parts',
            },
            {
                heading: 'DCF (Discounted Cash Flow)',
                content: '**DCF** คือการคำนวณมูลค่าปัจจุบันของ **กระแสเงินสดที่บริษัทจะสร้างในอนาคต**\n\n**แนวคิด:** เงิน $100 ในอีก 5 ปี มีค่าน้อยกว่า $100 วันนี้\n\n**สูตรหลัก:**\nIntrinsic Value = Σ (FCFₜ / (1+r)ᵗ) + Terminal Value / (1+r)ⁿ\n\n**ขั้นตอน:**\n1. **ประมาณ Free Cash Flow (FCF)** ในอีก 5-10 ปีข้างหน้า\n2. **เลือก Discount Rate (r)** — ส่วนใหญ่ใช้ WACC (8-12%)\n3. **คำนวณ Terminal Value** — มูลค่าหลังจากปีที่ 10 เป็นต้นไป\n4. **หารทั้งหมดด้วย จำนวนหุ้น** = Intrinsic Value ต่อหุ้น\n\n**ตัวอย่าง Apple:**\n- FCF ปีนี้: $100B, เติบโต 5%/ปี\n- Discount Rate: 10%\n- Terminal Growth: 3%\n- จำนวนหุ้น: 15B\n→ Intrinsic Value ≈ $180-200/หุ้น\n\n**ข้อจำกัด:**\n- ขึ้นอยู่กับสมมติฐาน (เปลี่ยน 1% ผลต่างมาก)\n- ไม่เหมาะกับบริษัทที่ยังไม่ทำกำไร (Startup)',
            },
            {
                heading: 'Comparable Analysis (เปรียบเทียบ)',
                content: '**Comparable Analysis** คือการเปรียบเทียบ **อัตราส่วนทางการเงิน** ของบริษัทกับคู่แข่งในอุตสาหกรรมเดียวกัน\n\n**อัตราส่วนที่ใช้บ่อย:**\n\n| อัตราส่วน | สูตร | ใช้กับ |\n|-----------|------|--------|\n| **P/E** | ราคา ÷ EPS | ทั่วไป |\n| **EV/EBITDA** | Enterprise Value ÷ EBITDA | เปรียบเทียบข้ามโครงสร้างทุน |\n| **P/S** | ราคา ÷ Revenue per Share | บริษัทขาดทุน |\n| **P/B** | ราคา ÷ Book Value | ธนาคาร, อสังหาริมทรัพย์ |\n| **PEG** | P/E ÷ Growth Rate | พิจารณาการเติบโต |\n\n**วิธีทำ:**\n1. หา **Peer Group** — บริษัทคู่แข่งขนาดใกล้เคียง (เช่น AAPL vs MSFT vs GOOGL)\n2. คำนวณ **ค่าเฉลี่ย** ของอัตราส่วน\n3. ถ้าหุ้นเป้าหมายมี P/E **ต่ำกว่า** ค่าเฉลี่ย → อาจเป็น Value\n\n**ข้อดี:** ง่ายกว่า DCF, ใช้ข้อมูลจริง\n**ข้อเสีย:** ทุกบริษัทในกลุ่มอาจ Overvalued พร้อมกัน',
            },
            {
                heading: 'Enterprise Value (EV) และ WACC',
                content: '**Enterprise Value (EV):**\n\nEV = Market Cap + หนี้สิน − เงินสด\n\n**ทำไมใช้ EV?**\n- Market Cap บอกแค่มูลค่าส่วนของผู้ถือหุ้น\n- EV บอก **มูลค่าทั้งหมด** ของธุรกิจ (รวมหนี้)\n- ทำให้เปรียบเทียบบริษัทที่มีหนี้ต่างกันได้\n\n**WACC (Weighted Average Cost of Capital):**\n\nWACC = (E/V × Re) + (D/V × Rd × (1−Tax))\n\n- **Re** = Cost of Equity (ผลตอบแทนที่ผู้ถือหุ้นคาดหวัง)\n- **Rd** = Cost of Debt (ดอกเบี้ยเงินกู้)\n- **E/V** = สัดส่วนทุน, **D/V** = สัดส่วนหนี้\n\n**WACC ยิ่งต่ำ → Intrinsic Value ยิ่งสูง**\n\n💡 ส่วนใหญ่ WACC อยู่ที่ 8-12% สำหรับบริษัทขนาดใหญ่\n⚠️ บริษัทที่มีหนี้มากจะมี WACC สูงกว่า → มูลค่าต่ำกว่า',
            },
        ],
        keyTakeaways: [
            'Intrinsic Value = มูลค่าที่แท้จริงของหุ้น ตามพื้นฐาน',
            'DCF ประเมินจากกระแสเงินสดในอนาคต — ขึ้นอยู่กับสมมติฐาน',
            'Comparable Analysis เปรียบเทียบ P/E, EV/EBITDA กับคู่แข่ง',
            'ซื้อเมื่อราคาต่ำกว่า Intrinsic Value 20-30% (Margin of Safety)',
        ],
        quiz: [
            { question: 'DCF ย่อมาจากอะไร?', options: ['Direct Cash Fund', 'Discounted Cash Flow', 'Dividend Capital Formula', 'Debt Coverage Factor'], answer: 1 },
            { question: 'Enterprise Value คำนวณอย่างไร?', options: ['Market Cap + เงินสด', 'Market Cap + หนี้ − เงินสด', 'Revenue × PE', 'กำไร × จำนวนหุ้น'], answer: 1 },
            { question: 'Margin of Safety คืออะไร?', options: ['กำไรขั้นต่ำที่ยอมรับได้', 'ส่วนต่างระหว่าง Intrinsic Value กับราคาที่ซื้อ', 'จุด Stop Loss', 'เงินสำรองฉุกเฉิน'], answer: 1 },
        ],
    },
    {
    // ═══════════════════════════════════
    // Module 8: Advanced Topics
    // ═══════════════════════════════════
        id: 'macro-economics',
        title: 'เศรษฐกิจมหภาคกับตลาดหุ้น',
        titleEn: 'Macroeconomics & the Stock Market',
        description: 'เข้าใจว่าดอกเบี้ย เงินเฟ้อ GDP และนโยบาย Fed ส่งผลต่อราคาหุ้นอย่างไร',
        category: 'advanced',
        module: 8,
        order: 23,
        difficulty: 'advanced',
        duration: 18,
        icon: '🌐',
        thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Fed และดอกเบี้ย',
                content: '**Federal Reserve (Fed)** คือธนาคารกลางสหรัฐ ทำหน้าที่กำหนดนโยบายการเงิน\n\n**Federal Funds Rate (FFR):**\n- อัตราดอกเบี้ยที่ Fed กำหนด\n- มีผลต่อดอกเบี้ยทั้งระบบ (สินเชื่อบ้าน, รถยนต์, บัตรเครดิต)\n\n**ดอกเบี้ยกับหุ้น:**\n- 📉 **ดอกเบี้ยขึ้น → หุ้นมักลง**\n  - ต้นทุนกู้เงินของบริษัทเพิ่ม → กำไรลด\n  - พันธบัตรให้ผลตอบแทนสูงขึ้น → คนย้ายเงินจากหุ้นไปพันธบัตร\n  - Discount Rate สูงขึ้น → Intrinsic Value ของหุ้นลดลง\n\n- 📈 **ดอกเบี้ยลง → หุ้นมักขึ้น**\n  - ต้นทุนกู้เงินถูก → บริษัทขยายตัวง่าย\n  - พันธบัตรให้ผลตอบแทนน้อย → คนย้ายเงินมาหุ้น\n\n**FOMC Meeting:**\n- ประชุม 8 ครั้ง/ปี ตัดสินใจเรื่องดอกเบี้ย\n- วันประชุม FOMC ตลาดจะผันผวนมาก\n\n💡 ติดตาม **Fed Dot Plot** เพื่อดูแนวโน้มดอกเบี้ยในอนาคต',
            },
            {
                heading: 'เงินเฟ้อ (Inflation)',
                content: '**Inflation** = ราคาสินค้าและบริการเพิ่มขึ้นเมื่อเวลาผ่านไป\n\n**ตัวชี้วัดเงินเฟ้อ:**\n- **CPI (Consumer Price Index)** — วัดราคาสินค้าอุปโภคบริโภค\n- **PCE (Personal Consumption Expenditures)** — ตัวที่ Fed ใช้ดูมากที่สุด\n- **Core Inflation** — ไม่รวมอาหารและพลังงาน (ผันผวนน้อยกว่า)\n\n**เงินเฟ้อกับหุ้น:**\n- เงินเฟ้อ **ปานกลาง (2-3%)** → ดีสำหรับหุ้น ธุรกิจขึ้นราคาสินค้าได้\n- เงินเฟ้อ **สูง (>5%)** → แย่สำหรับหุ้น Fed จะขึ้นดอกเบี้ย\n- **Deflation** (เงินฝืด) → แย่มาก เศรษฐกิจชะงัก\n\n**หุ้นที่ทนเงินเฟ้อได้ดี:**\n- พลังงาน, สินค้าโภคภัณฑ์\n- อสังหาริมทรัพย์ (REITs)\n- บริษัทที่มี Pricing Power (เช่น Apple, Coca-Cola)\n\n**หุ้นที่เจ็บหนัก:**\n- หุ้น Growth (PE สูง) — Discount Rate สูงขึ้นกระทบมาก\n- หุ้นเทคโนโลยีที่ยังไม่ทำกำไร',
            },
            {
                heading: 'GDP และ Recession',
                content: '**GDP (Gross Domestic Product)** = มูลค่ารวมของสินค้าและบริการที่ประเทศผลิตได้\n\n**GDP กับตลาดหุ้น:**\n- GDP โต → เศรษฐกิจดี → บริษัทขายของได้ → หุ้นมักขึ้น\n- GDP หด → เศรษฐกิจแย่ → บริษัทขายของไม่ออก → หุ้นมักลง\n\n**Recession (ภาวะถดถอย):**\n- GDP หดตัว **2 ไตรมาสติดต่อกัน**\n- ตลาดหุ้นมักลง 20-40%\n- แต่ตลาดมักจะ **ลงก่อน** Recession 6-9 เดือน และ **ขึ้นก่อน** Recession จบ\n\n**Economic Cycle (วัฏจักรเศรษฐกิจ):**\n1. 📈 **Expansion** — เศรษฐกิจเติบโต หุ้นขึ้น\n2. 🏔️ **Peak** — จุดสูงสุด ทุกอย่างดูดี\n3. 📉 **Contraction** — เศรษฐกิจชะลอ หุ้นลง\n4. 🏜️ **Trough** — จุดต่ำสุด → โอกาสซื้อหุ้นราคาถูก\n\n💡 ตลาดหุ้นเป็น **Leading Indicator** — เคลื่อนไหวล่วงหน้าก่อนเศรษฐกิจจริง',
            },
            {
                heading: 'ตัวเลขเศรษฐกิจที่ต้องติดตาม',
                content: '**📊 ตัวเลขสำคัญสำหรับนักลงทุน:**\n\n| ตัวเลข | ออกเมื่อ | ผลต่อตลาด |\n|--------|---------|------------|\n| **Non-Farm Payrolls** | ศุกร์แรกของเดือน | การจ้างงานนอกภาคเกษตร |\n| **CPI** | กลางเดือน | เงินเฟ้อ |\n| **FOMC Statement** | 8 ครั้ง/ปี | นโยบายดอกเบี้ย |\n| **GDP** | รายไตรมาส | การเติบโตเศรษฐกิจ |\n| **PMI** | ต้นเดือน | สุขภาพภาคการผลิต |\n| **Consumer Confidence** | สิ้นเดือน | ความเชื่อมั่นผู้บริโภค |\n\n**Yield Curve:**\n- **Normal** (พันธบัตรยาวให้ดอกเบี้ยสูงกว่าสั้น) → เศรษฐกิจปกติ\n- **Inverted** (พันธบัตรสั้นให้ดอกเบี้ยสูงกว่ายาว) → สัญญาณ Recession!\n- Inverted Yield Curve ทำนาย Recession ได้แม่นมากในอดีต\n\n💡 ใช้ **Economic Calendar** เช่น investing.com ติดตามตัวเลขเหล่านี้',
            },
        ],
        keyTakeaways: [
            'ดอกเบี้ยขึ้น → หุ้นมักลง, ดอกเบี้ยลง → หุ้นมักขึ้น',
            'เงินเฟ้อปานกลาง (2-3%) ดี แต่เงินเฟ้อสูงทำให้ Fed ขึ้นดอกเบี้ย',
            'ตลาดหุ้นเป็น Leading Indicator เคลื่อนไหวล่วงหน้าก่อนเศรษฐกิจจริง',
            'Inverted Yield Curve เป็นสัญญาณ Recession ที่แม่นยำ',
        ],
        quiz: [
            { question: 'เมื่อ Fed ขึ้นดอกเบี้ย ตลาดหุ้นมักจะ?', options: ['ขึ้นเสมอ', 'ลง เพราะต้นทุนกู้เงินเพิ่ม', 'ไม่มีผล', 'ขึ้นเฉพาะหุ้นเทค'], answer: 1 },
            { question: 'Recession คืออะไร?', options: ['ตลาดหุ้นลง 10%', 'GDP หดตัว 2 ไตรมาสติดต่อกัน', 'เงินเฟ้อสูงกว่า 5%', 'อัตราว่างงานสูงกว่า 10%'], answer: 1 },
            { question: 'Inverted Yield Curve บ่งบอกอะไร?', options: ['เศรษฐกิจกำลังจะเฟื่องฟู', 'สัญญาณ Recession ข้างหน้า', 'ดอกเบี้ยจะลง', 'เงินเฟ้อจะหายไป'], answer: 1 },
        ],
    },

    // ═══════════════════════════════════
    // Module 6: Investment Strategies
    // ═══════════════════════════════════
    {
        id: 'dca-strategy',
        title: 'กลยุทธ์ DCA (ลงทุนสม่ำเสมอ)',
        titleEn: 'Dollar-Cost Averaging Strategy',
        description: 'เรียนรู้กลยุทธ์ DCA ที่เหมาะกับมือใหม่มากที่สุด',
        category: 'strategies',
        module: 6,
        order: 16,
        difficulty: 'beginner',
        duration: 8,
        icon: '📅',
        thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'DCA คืออะไร?',
                content: '**Dollar-Cost Averaging (DCA)** คือการลงทุนจำนวนเงินเท่าๆ กัน ในระยะเวลาสม่ำเสมอ โดยไม่สนราคาหุ้น\n\nตัวอย่าง: ลงทุน $500 ทุกเดือนในหุ้น AAPL\n- เดือน 1: ราคา $200 → ซื้อได้ 2.5 หุ้น\n- เดือน 2: ราคา $180 → ซื้อได้ 2.78 หุ้น (ซื้อได้มากขึ้น!)\n- เดือน 3: ราคา $220 → ซื้อได้ 2.27 หุ้น\n\nค่าเฉลี่ยต้นทุน = **ถูกกว่า** การซื้อครั้งเดียวที่จุดสูงสุด',
            },
            {
                heading: 'ทำไม DCA ถึงดี?',
                content: '1. **ลดความเสี่ยง** — ไม่ต้องจับจังหวะตลาด (Market Timing)\n2. **ลดอารมณ์** — ไม่ต้องกังวลว่าวันนี้ราคาขึ้นหรือลง\n3. **สร้างวินัย** — ลงทุนอัตโนมัติทุกเดือน\n4. **ผลดีระยะยาว** — ตลาดหุ้นโดยรวมให้ผลตอบแทน ~10%/ปี\n\n💡 Warren Buffett แนะนำ DCA ในกองทุนดัชนี S&P 500 สำหรับคนทั่วไป',
            },
            {
                heading: 'ข้อควรระวัง',
                content: '- DCA **ไม่ได้** หมายความว่าจะไม่ขาดทุน\n- ไม่เหมาะกับ **ตลาดขาลงยาวนาน** (Bear Market)\n- ค่าธรรมเนียมซื้อขายอาจสูงถ้าซื้อบ่อยเกินไป\n- เลือกหุ้นหรือกองทุนที่ **มีแนวโน้มเติบโตระยะยาว**\n\n**แนะนำสำหรับ DCA:**\n- S&P 500 Index Fund (SPY, VOO)\n- หุ้น Blue-Chip ที่มั่นคง\n- ลงทุนอย่างน้อย 5 ปีขึ้นไป',
            },
        ],
        keyTakeaways: [
            'DCA = ลงทุนจำนวนเท่ากันสม่ำเสมอ ไม่สนราคา',
            'ลดความเสี่ยงจากการจับจังหวะตลาด',
            'เหมาะกับมือใหม่ ช่วยสร้างวินัยการลงทุน',
            'เลือกหุ้น/กองทุนที่มีแนวโน้มเติบโตระยะยาว',
        ],
    },
    {
        id: 'portfolio-diversification',
        title: 'การกระจายพอร์ต (Diversification)',
        titleEn: 'Portfolio Diversification',
        description: 'ทำไมไม่ควรใส่ไข่ทุกฟองไว้ในตะกร้าใบเดียว',
        category: 'strategies',
        module: 6,
        order: 17,
        difficulty: 'beginner',
        duration: 10,
        icon: '🧺',
        thumbnail: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ba58?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Diversification คืออะไร?',
                content: '**การกระจายพอร์ต** คือการลงทุนในสินทรัพย์หลายประเภท เพื่อลดความเสี่ยง\n\n"อย่าใส่ไข่ทุกฟองไว้ในตะกร้าใบเดียว" 🥚🧺\n\nถ้าลงทุนแค่หุ้นเดียว → ถ้าหุ้นนั้นลง 50% พอร์ตคุณลง 50%\nถ้าลงทุน 10 หุ้น → ถ้าหุ้นหนึ่งลง 50% พอร์ตลงแค่ 5%',
            },
            {
                heading: 'กระจายอย่างไร?',
                content: '**ระดับ 1: กระจายข้ามอุตสาหกรรม**\n- Technology: AAPL, MSFT\n- Healthcare: JNJ, UNH\n- Financials: JPM, V\n- Consumer: WMT, PG\n\n**ระดับ 2: กระจายข้ามประเภทสินทรัพย์**\n- หุ้น 60-70%\n- พันธบัตร 20-30%\n- เงินสด/ทอง 10%\n\n**ระดับ 3: กระจายข้ามภูมิศาสตร์**\n- หุ้นสหรัฐ, ยุโรป, เอเชีย',
            },
            {
                heading: 'พอร์ตตัวอย่างสำหรับมือใหม่',
                content: '**พอร์ตมือใหม่ (เสี่ยงปานกลาง):**\n\n| สัดส่วน | สินทรัพย์ | ตัวอย่าง |\n|---------|----------|----------|\n| 40% | หุ้น Blue-Chip | AAPL, MSFT, GOOGL |\n| 20% | หุ้นเติบโต | NVDA, AMZN |\n| 20% | หุ้นปันผล | KO, JNJ, PG |\n| 10% | กองทุนดัชนี | SPY (S&P 500) |\n| 10% | เงินสด | พร้อมใช้เมื่อมีโอกาส |\n\n💡 ปรับสัดส่วนตามอายุและความเสี่ยงที่รับได้',
            },
        ],
        keyTakeaways: [
            'กระจายพอร์ตช่วยลดความเสี่ยง',
            'กระจายข้ามอุตสาหกรรม ประเภทสินทรัพย์ และภูมิศาสตร์',
            'มือใหม่ควรผสม Blue-Chip + Dividend + Index Fund',
            'ปรับสัดส่วนตามอายุและความเสี่ยงที่รับได้',
        ],
    },
    {
        id: 'long-term-investing',
        title: 'การลงทุนระยะยาว',
        titleEn: 'Long-term Investing',
        description: 'พลังของดอกเบี้ยทบต้น และทำไมเวลาคือเพื่อนที่ดีที่สุดของนักลงทุน',
        category: 'strategies',
        module: 6,
        order: 18,
        difficulty: 'beginner',
        duration: 10,
        icon: '⏳',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'พลังของดอกเบี้ยทบต้น (Compound Interest)',
                content: '"ดอกเบี้ยทบต้นคือสิ่งมหัศจรรย์อันดับ 8 ของโลก" — Albert Einstein\n\nตัวอย่าง: ลงทุน $10,000 ผลตอบแทน 10%/ปี\n- ปีที่ 1: $11,000\n- ปีที่ 5: $16,105\n- ปีที่ 10: $25,937\n- ปีที่ 20: $67,275\n- ปีที่ 30: **$174,494**\n\n💡 เงินของคุณเพิ่มขึ้น **17 เท่า** ในเวลา 30 ปี โดยไม่ต้องลงเงินเพิ่ม!',
            },
            {
                heading: 'Time in the Market > Timing the Market',
                content: '**อยู่ในตลาดนานๆ** ดีกว่า **จับจังหวะ**\n\nข้อมูลจริง: S&P 500 ตั้งแต่ปี 1993-2023\n- ลงทุนตลอด 30 ปี → ผลตอบแทน ~10%/ปี\n- พลาดแค่ 10 วันที่ดีที่สุด → ผลตอบแทนลดลงครึ่งหนึ่ง!\n- พลาด 20 วันที่ดีที่สุด → แทบไม่ได้กำไร\n\n💡 ไม่มีใครรู้ว่าวันไหนราคาจะพุ่ง ดังนั้นอยู่ในตลาดตลอดเวลาดีที่สุด',
            },
            {
                heading: 'แนวคิดนักลงทุนระดับโลก',
                content: '**Warren Buffett:**\n"ระยะเวลาที่ถือหุ้นที่ดีที่สุดคือ... ตลอดไป"\n\n**Peter Lynch:**\n"เงินได้จากหุ้นที่อดทนถือ ไม่ใช่ซื้อๆ ขายๆ"\n\n**Jack Bogle (ผู้ก่อตั้ง Vanguard):**\n"อย่าหาเข็มในมหาสมุทร ซื้อทั้งมหาสมุทรเลย" (กองทุนดัชนี)\n\n**สรุป:**\n- เลือกบริษัทดี\n- ซื้อในราคาเหมาะสม\n- ถือยาว\n- อดทน!',
            },
        ],
        keyTakeaways: [
            'ดอกเบี้ยทบต้นทำให้เงินเติบโตแบบทวีคูณ',
            'อยู่ในตลาดนานๆ ดีกว่าจับจังหวะ',
            'เริ่มลงทุนเร็ว = มีเวลาให้ดอกเบี้ยทบต้นทำงานมากขึ้น',
            'อดทนและไม่ตกใจกับความผันผวนระยะสั้น',
        ],
    },
    {
        id: 'options-trading',
        title: 'Options Trading เบื้องต้น',
        titleEn: 'Introduction to Options Trading',
        description: 'เข้าใจ Call/Put Options, Greeks, กลยุทธ์พื้นฐาน และความเสี่ยงของ Options สำหรับนักลงทุนที่มีประสบการณ์',
        category: 'advanced',
        module: 8,
        order: 24,
        difficulty: 'advanced',
        duration: 20,
        icon: '🎲',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Options คืออะไร?',
                content: '**Options (ออปชั่น)** คือสัญญาที่ให้ **สิทธิ** (แต่ไม่ใช่ข้อผูกมัด) ในการซื้อหรือขายหุ้นในราคาที่กำหนด ภายในระยะเวลาที่กำหนด\n\n**องค์ประกอบของ Options:**\n- **Underlying** — หุ้นอ้างอิง (เช่น AAPL)\n- **Strike Price** — ราคาที่กำหนดในสัญญา\n- **Expiration Date** — วันหมดอายุของสัญญา\n- **Premium** — ราคาของ Options (ค่าสัญญา)\n- **Contract Size** — 1 สัญญา = 100 หุ้น\n\n**2 ประเภทหลัก:**\n- 📈 **Call Option** — สิทธิในการ **ซื้อ** หุ้น\n- 📉 **Put Option** — สิทธิในการ **ขาย** หุ้น\n\n⚠️ **Options มีความเสี่ยงสูงมาก** — เงินที่จ่ายค่า Premium อาจหายไปทั้งหมดเมื่อ Options หมดอายุ',
            },
            {
                heading: 'Call Option และ Put Option',
                content: '**📈 Call Option (สิทธิซื้อ):**\n\nซื้อ Call เมื่อคิดว่าราคาหุ้นจะ **ขึ้น**\n\nตัวอย่าง: AAPL ราคา $200\n- ซื้อ Call Strike $210, หมดอายุ 30 วัน, Premium $5\n- ค่าใช้จ่าย: $5 × 100 หุ้น = **$500**\n- ถ้า AAPL ขึ้นเป็น $230 → กำไร = ($230-$210-$5) × 100 = **$1,500**\n- ถ้า AAPL ยังอยู่ที่ $200 → ขาดทุน **$500** (ทั้งหมดที่จ่าย)\n\n**📉 Put Option (สิทธิขาย):**\n\nซื้อ Put เมื่อคิดว่าราคาหุ้นจะ **ลง** (หรือใช้ป้องกันพอร์ต)\n\nตัวอย่าง: ถือ AAPL ราคา $200\n- ซื้อ Put Strike $190, Premium $4\n- ค่าใช้จ่าย: $4 × 100 = **$400**\n- ถ้า AAPL ลงเป็น $160 → Put ป้องกันคุณจากขาดทุนที่ต่ำกว่า $190\n- เหมือน **ประกันภัย** สำหรับพอร์ตของคุณ\n\n💡 **Protective Put** = ซื้อ Put เพื่อป้องกันหุ้นที่ถืออยู่ — เหมือนซื้อประกัน',
            },
            {
                heading: 'Options Greeks',
                content: '**Greeks** คือตัวเลขที่บอกว่า ราคา Options จะเปลี่ยนแปลงอย่างไร:\n\n**🔺 Delta (Δ):**\n- ราคา Options เปลี่ยนเท่าไหร่ เมื่อราคาหุ้นเปลี่ยน $1\n- Call: Delta 0 ถึง 1 (เช่น 0.5 = หุ้นขึ้น $1, Options ขึ้น $0.50)\n- Put: Delta 0 ถึง -1\n\n**⏰ Theta (Θ):**\n- การสูญเสียมูลค่าตามเวลา (Time Decay)\n- Options **เสียมูลค่าทุกวัน** ที่ใกล้หมดอายุ\n- ⚠️ ศัตรูหมายเลข 1 ของคนซื้อ Options\n\n**📊 Gamma (Γ):**\n- อัตราการเปลี่ยนแปลงของ Delta\n- Gamma สูง = Delta เปลี่ยนเร็ว (ใกล้หมดอายุ)\n\n**📈 Vega (V):**\n- ผลของ Volatility ต่อราคา Options\n- Volatility สูง → Options แพงขึ้น\n- Volatility ต่ำ → Options ถูกลง\n\n**Implied Volatility (IV):**\n- ความผันผวนที่ตลาดคาดการณ์\n- IV สูง = Options แพง (เช่น ก่อนประกาศงบ)\n- IV ต่ำ = Options ถูก',
            },
            {
                heading: 'กลยุทธ์ Options พื้นฐาน',
                content: '**1. Covered Call (ขาย Call ทับหุ้นที่ถือ):**\n- ถือ 100 หุ้น AAPL + ขาย 1 Call\n- ได้ Premium เป็นรายได้เสริม\n- เสี่ยง: ถ้าหุ้นขึ้นเกิน Strike ต้องขายหุ้นไป\n- **เหมาะกับ:** สร้างรายได้จากหุ้นที่ถืออยู่\n\n**2. Protective Put (ซื้อ Put ป้องกัน):**\n- ถือหุ้น + ซื้อ Put\n- จำกัดขาดทุน ไม่ว่าหุ้นลงเท่าไหร่\n- เสียค่า Premium เป็นค่าประกัน\n- **เหมาะกับ:** ป้องกันพอร์ตช่วงไม่แน่นอน\n\n**3. Long Straddle (ซื้อทั้ง Call และ Put):**\n- ซื้อ Call + Put Strike เดียวกัน\n- กำไรเมื่อราคาเคลื่อนที่มาก ไม่ว่าขึ้นหรือลง\n- ขาดทุนเมื่อราคาไม่ค่อยเปลี่ยน\n- **เหมาะกับ:** ก่อนเหตุการณ์สำคัญ (Earnings, FOMC)\n\n🚫 **สิ่งที่มือใหม่ไม่ควรทำ:**\n- ❌ ขาย Naked Options (เสี่ยงไม่จำกัด)\n- ❌ ซื้อ Options ใกล้หมดอายุ (Time Decay สูงมาก)\n- ❌ ใช้เงินมากกว่า 5% ของพอร์ตกับ Options',
            },
        ],
        keyTakeaways: [
            'Call = สิทธิซื้อ (หวังราคาขึ้น), Put = สิทธิขาย (หวังราคาลง)',
            'Options หมดอายุเป็น 0 ได้ — เสี่ยงเสียเงินทั้งหมดที่จ่าย',
            'Theta กินมูลค่า Options ทุกวัน — เวลาเป็นศัตรู',
            'เริ่มด้วย Covered Call หรือ Protective Put ก่อนกลยุทธ์ซับซ้อน',
        ],
        quiz: [
            { question: 'Call Option ให้สิทธิอะไร?', options: ['สิทธิในการขายหุ้น', 'สิทธิในการซื้อหุ้นในราคาที่กำหนด', 'สิทธิในการรับเงินปันผล', 'สิทธิในการยืมหุ้น'], answer: 1 },
            { question: 'Theta หมายถึงอะไร?', options: ['การเปลี่ยนแปลงราคาตามหุ้น', 'การสูญเสียมูลค่าตามเวลา', 'ผลของ Volatility', 'อัตราการเปลี่ยน Delta'], answer: 1 },
            { question: 'Covered Call คืออะไร?', options: ['ซื้อ Call โดยไม่ถือหุ้น', 'ขาย Call ทับหุ้นที่ถืออยู่เพื่อรับ Premium', 'ซื้อ Call + Put พร้อมกัน', 'ขาย Put เพื่อซื้อหุ้นราคาถูก'], answer: 1 },
        ],
    },

    // ═══════════════════════════════════
    // Module 7: Risk Management
    // ═══════════════════════════════════
    {
        id: 'understanding-risk',
        title: 'เข้าใจความเสี่ยงในการลงทุน',
        titleEn: 'Understanding Investment Risk',
        description: 'ความเสี่ยงมีกี่ประเภท? และทำไมความเสี่ยง ≠ ไม่ดี',
        category: 'risk-management',
        module: 7,
        order: 19,
        difficulty: 'beginner',
        duration: 10,
        icon: '⚠️',
        thumbnail: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ความเสี่ยง ≠ อันตราย',
                content: 'ในการลงทุน **ความเสี่ยง** หมายถึง "ความไม่แน่นอน" — ผลตอบแทนอาจมากกว่าหรือน้อยกว่าที่คาด\n\n**กฎสำคัญ:** ผลตอบแทนสูง = ความเสี่ยงสูง\n- เงินฝากธนาคาร: ความเสี่ยงต่ำ ผลตอบแทน 1-2%/ปี\n- พันธบัตรรัฐบาล: ความเสี่ยงต่ำ ผลตอบแทน 3-5%/ปี\n- หุ้น Blue-Chip: ความเสี่ยงปานกลาง ผลตอบแทน 8-12%/ปี\n- หุ้น Growth: ความเสี่ยงสูง ผลตอบแทน 15%+/ปี (หรือขาดทุน)',
            },
            {
                heading: 'ประเภทของความเสี่ยง',
                content: '**1. Market Risk (ความเสี่ยงตลาด)**\n— ตลาดทั้งหมดลง เช่น วิกฤตเศรษฐกิจ\n\n**2. Company Risk (ความเสี่ยงบริษัท)**\n— บริษัทเดียวมีปัญหา เช่น สินค้าล้มเหลว ผู้บริหารทุจริต\n\n**3. Sector Risk (ความเสี่ยงอุตสาหกรรม)**\n— ทั้งอุตสาหกรรมถูกกระทบ เช่น น้ำมันราคาลง → หุ้นพลังงานลง\n\n**4. Currency Risk (ความเสี่ยงค่าเงิน)**\n— ลงทุนหุ้นต่างประเทศ ค่าเงินผันผวน\n\n**5. Inflation Risk (ความเสี่ยงเงินเฟ้อ)**\n— ผลตอบแทนน้อยกว่าอัตราเงินเฟ้อ = ขาดทุนจริงๆ',
            },
            {
                heading: 'วัดความเสี่ยงอย่างไร?',
                content: '**Beta (เบต้า):**\n- Beta = 1 → เคลื่อนไหวเท่าตลาด\n- Beta > 1 → ผันผวนมากกว่าตลาด (เช่น TSLA)\n- Beta < 1 → ผันผวนน้อยกว่าตลาด (เช่น JNJ)\n\n**Standard Deviation:**\n- วัดว่าราคาผันผวนแค่ไหน\n- ค่าสูง = เสี่ยงมาก\n\n💡 ใน FinLearn คุณจะเห็น **Risk Score** ที่คำนวณจากหลายปัจจัย ช่วยให้ตัดสินใจง่ายขึ้น',
            },
        ],
        keyTakeaways: [
            'ความเสี่ยงสูง = โอกาสผลตอบแทนสูง (และขาดทุนสูง)',
            'ความเสี่ยงมีหลายประเภท: ตลาด, บริษัท, อุตสาหกรรม, ค่าเงิน',
            'Beta วัดว่าหุ้นผันผวนมากกว่าตลาดแค่ไหน',
            'กระจายพอร์ตช่วยลดความเสี่ยงบริษัทและอุตสาหกรรม',
        ],
    },
    {
        id: 'stop-loss',
        title: 'Stop Loss คืออะไร?',
        titleEn: 'Understanding Stop Loss',
        description: 'เรียนรู้วิธีตั้ง Stop Loss เพื่อจำกัดการขาดทุน',
        category: 'risk-management',
        module: 7,
        order: 20,
        difficulty: 'intermediate',
        duration: 8,
        icon: '🛑',
        thumbnail: 'https://images.unsplash.com/photo-1535320903710-d946a44a5642?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'Stop Loss คืออะไร?',
                content: '**Stop Loss** คือคำสั่งขายอัตโนมัติเมื่อราคาหุ้นลดลงถึงจุดที่กำหนด\n\nตัวอย่าง: ซื้อ AAPL ที่ $200 ตั้ง Stop Loss ที่ $180\n→ ถ้าราคาลดลงถึง $180 ระบบจะขายอัตโนมัติ\n→ ขาดทุนแค่ 10% ไม่ใช่ 30% หรือ 50%\n\n**ทำไมสำคัญ?**\n"ตัดขาดทุน ปล่อยกำไรวิ่ง" (Cut losses short, let profits run)',
            },
            {
                heading: 'ตั้ง Stop Loss อย่างไร?',
                content: '**กฎทั่วไป:**\n- หุ้น Blue-Chip: Stop Loss 7-10% ต่ำกว่าราคาซื้อ\n- หุ้น Growth: Stop Loss 10-15%\n- หุ้นเก็งกำไร: Stop Loss 15-20%\n\n**Trailing Stop Loss:**\n- ขยับ Stop Loss ขึ้นตามราคาที่ขึ้น\n- ตัวอย่าง: ซื้อ $200 → ราคาขึ้นเป็น $250 → ตั้ง Stop Loss ที่ $225 (10%)\n\n**ข้อควรระวัง:**\n- ตั้งไม่แน่นเกินไป (5%) อาจโดนขายจากความผันผวนปกติ\n- ตั้งห่างเกินไป (30%) อาจขาดทุนมาก',
            },
        ],
        keyTakeaways: [
            'Stop Loss = ขายอัตโนมัติเมื่อราคาลงถึงจุดที่กำหนด',
            'ช่วยจำกัดการขาดทุน ไม่ให้เสียมากเกินไป',
            'Trailing Stop Loss ช่วยล็อคกำไรเมื่อราคาขึ้น',
            'มือใหม่ควรตั้ง Stop Loss ทุกครั้งที่ซื้อหุ้น',
        ],
    },
    {
        id: 'common-mistakes',
        title: 'ข้อผิดพลาดที่พบบ่อย',
        titleEn: 'Common Investment Mistakes',
        description: 'หลีกเลี่ยงข้อผิดพลาดที่นักลงทุนมือใหม่ทำบ่อยที่สุด',
        category: 'risk-management',
        module: 7,
        order: 21,
        difficulty: 'beginner',
        duration: 10,
        icon: '🚫',
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848e968838?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ข้อผิดพลาด #1: ลงทุนตามกระแส (FOMO)',
                content: '**FOMO (Fear of Missing Out)** — กลัวตกขบวน\n\nเห็นคนอื่นรวยจากหุ้นตัวนี้ → ซื้อตาม → ราคาลง\n\n**วิธีแก้:**\n- ทำการบ้านก่อนซื้อเสมอ\n- ถ้าหุ้นขึ้นมา 100% แล้ว อาจสายเกินไป\n- มีแผนการลงทุนและยึดมั่นกับแผน\n\n💡 Warren Buffett: "จงกลัวเมื่อคนอื่นโลภ และโลภเมื่อคนอื่นกลัว"',
            },
            {
                heading: 'ข้อผิดพลาด #2: ไม่กระจายพอร์ต',
                content: 'ลงทุนหุ้นตัวเดียว 100% → เสี่ยงมาก!\n\n**ตัวอย่างจริง:**\n- พนักงาน Enron ที่ลงทุนหุ้น Enron 100% → สูญเงินทั้งหมดเมื่อบริษัทล้มละลาย\n\n**วิธีแก้:**\n- ลงทุนอย่างน้อย 5-10 หุ้น\n- กระจายข้ามอุตสาหกรรม\n- ใส่ส่วนหนึ่งในกองทุนดัชนี',
            },
            {
                heading: 'ข้อผิดพลาด #3: ขายตอนกลัว',
                content: '**Panic Selling** — ตลาดลง → กลัว → ขายทิ้ง → พลาดการฟื้นตัว\n\nตัวอย่าง: COVID-19 มีนาคม 2020\n- S&P 500 ลง 34% ใน 1 เดือน\n- คนที่ขายตอนนั้นขาดทุนหนัก\n- คนที่ถือต่อ: S&P 500 ขึ้นกลับมา 100%+ ภายใน 1 ปี!\n\n**วิธีแก้:**\n- มีแผนรับมือตลาดลงล่วงหน้า\n- จำไว้ว่าตลาดลงเป็นเรื่องปกติ\n- มีเงินสำรองฉุกเฉินแยกจากเงินลงทุน',
            },
            {
                heading: 'ข้อผิดพลาด #4: ไม่ตั้ง Stop Loss',
                content: 'ปล่อยให้ขาดทุนลุกลาม หวังว่าราคาจะกลับมา\n\n"หุ้นที่ลง 50% ต้องขึ้น 100% ถึงจะเท่าทุน"\n\n**วิธีแก้:**\n- ตั้ง Stop Loss ทุกครั้ง\n- ยอมรับขาดทุนเล็กน้อย ดีกว่าขาดทุนมหาศาล\n- ทบทวนพอร์ตเป็นประจำ',
            },
        ],
        keyTakeaways: [
            'อย่าลงทุนตามกระแส ทำการบ้านก่อนเสมอ',
            'กระจายพอร์ต อย่าใส่ไข่ในตะกร้าใบเดียว',
            'อย่าขายตอนตกใจ ตลาดลงเป็นเรื่องปกติ',
            'ตั้ง Stop Loss ทุกครั้ง ตัดขาดทุน ปล่อยกำไรวิ่ง',
        ],
    },
    {
        id: 'investment-psychology',
        title: 'จิตวิทยาการลงทุน',
        titleEn: 'Investment Psychology',
        description: 'เข้าใจอคติทางจิตวิทยาที่ทำให้นักลงทุนตัดสินใจผิดพลาด และวิธีควบคุมอารมณ์ในการลงทุน',
        category: 'risk-management',
        module: 7,
        order: 22,
        difficulty: 'beginner',
        duration: 12,
        icon: '🧠',
        thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'FOMO — กลัวตกรถ',
                content: '**FOMO (Fear of Missing Out)** = กลัวพลาดโอกาส\n\nอาการ:\n- เห็นหุ้นขึ้น 50% ใน 1 สัปดาห์ → อยากซื้อตาม\n- เห็นคนอื่นรวยจากหุ้น Meme → กลัวตกรถ\n- ซื้อโดยไม่ได้วิเคราะห์ เพราะ "ทุกคนซื้อกัน"\n\n**ตัวอย่างจริง:**\n- GameStop (GME) ปี 2021 ขึ้นจาก $20 → $480 → ลงกลับมา $40\n- คนที่ซื้อตอนจุดสูงสุดเพราะ FOMO ขาดทุนกว่า 90%\n\n**วิธีแก้:**\n- ถามตัวเอง: "ถ้าไม่มีใครพูดถึง ฉันจะซื้อไหม?"\n- มีแผนการลงทุนล่วงหน้า อย่าตัดสินใจเพราะอารมณ์\n- จำไว้: หุ้นที่ขึ้นเร็วมักลงเร็วเท่ากัน',
            },
            {
                heading: 'FUD — กลัวจนเกินไป',
                content: '**FUD (Fear, Uncertainty, Doubt)** = ความกลัว ความไม่แน่ใจ ความสงสัย\n\nอาการ:\n- ข่าวร้าย 1 ชิ้น → ขายทุกอย่าง\n- อ่านความเห็นในโซเชียล → กลัวจนไม่กล้าลงทุน\n- "ตลาดจะ Crash!" → ถอนเงินออกทั้งหมด\n\n**ความจริง:**\n- ตลาดหุ้นสหรัฐ **ขึ้นมาตลอด** ในระยะยาว (50+ ปี)\n- ทุกครั้งที่มี Crash ตลาดฟื้นตัวกลับมาเสมอ\n- ข่าว "ตลาดจะพัง" มีทุกปี แต่ S&P 500 ยังให้ผลตอบแทนเฉลี่ย ~10%/ปี\n\n**วิธีแก้:**\n- แยกข้อเท็จจริงออกจากความคิดเห็น\n- ดูข้อมูลระยะยาว ไม่ใช่ข่าวรายวัน\n- มีเงินสำรองฉุกเฉิน จะกลัวน้อยลง',
            },
            {
                heading: 'อคติที่พบบ่อยในนักลงทุน',
                content: '**1. Confirmation Bias (อคติยืนยัน):**\n- มองหาแต่ข้อมูลที่สนับสนุนสิ่งที่เชื่อ\n- ตัวอย่าง: ซื้อ TSLA แล้วอ่านแต่ข่าวดีของ Tesla ไม่สนข่าวร้าย\n- วิธีแก้: หาข้อมูลฝั่งตรงข้ามเสมอ ก่อนตัดสินใจ\n\n**2. Loss Aversion (กลัวขาดทุน):**\n- ความเจ็บปวดจากการขาดทุน $100 > ความสุขจากกำไร $100\n- ทำให้ถือหุ้นขาดทุนนานเกิน หวังว่าจะกลับมา\n- วิธีแก้: ตั้ง Stop Loss ล่วงหน้า ยอมตัดขาดทุน\n\n**3. Anchoring (ยึดติดราคา):**\n- "เคยราคา $200 ตอนนี้ $100 ถูกมาก!"\n- แต่จริงๆ หุ้นอาจลงเพราะพื้นฐานเปลี่ยน\n- วิธีแก้: ดูปัจจัยพื้นฐาน ไม่ใช่ราคาในอดีต\n\n**4. Recency Bias (อคติเหตุการณ์ล่าสุด):**\n- ตลาดขึ้นต่อเนื่อง → คิดว่าจะขึ้นตลอดไป\n- ตลาดลง 1 สัปดาห์ → คิดว่าจะลงไปเรื่อยๆ\n- วิธีแก้: ดูข้อมูลย้อนหลังหลายปี ไม่ใช่แค่สัปดาห์ล่าสุด',
            },
            {
                heading: 'วิธีควบคุมอารมณ์ในการลงทุน',
                content: '**📋 1. มีแผนเป็นลายลักษณ์อักษร:**\n- เขียนว่า: ซื้อหุ้นอะไร ทำไม ราคาเท่าไหร่ จะขายเมื่อไหร่\n- เมื่อมีแผน จะไม่ตัดสินใจจากอารมณ์\n\n**📅 2. ลงทุนแบบ DCA:**\n- ลงทุนทุกเดือน จำนวนเท่ากัน ไม่สนราคา\n- ลดอารมณ์ตื่นเต้น/ตกใจ ออกไป\n\n**🚫 3. อย่าดูพอร์ตบ่อยเกินไป:**\n- ดูทุกวัน = เครียดง่าย ตัดสินใจผิด\n- ดูสัปดาห์ละครั้งหรือเดือนละครั้งก็พอ\n\n**📰 4. จำกัดการอ่านข่าว:**\n- ข่าวหุ้นออกแบบมาให้ตื่นเต้น/ตกใจ\n- อ่านแค่งบไตรมาส + ข่าวสำคัญ\n\n**🧘 5. จำกฎ 24 ชั่วโมง:**\n- ก่อนซื้อ/ขายหุ้น รอ 24 ชั่วโมง\n- ถ้ายังคิดเหมือนเดิม ค่อยทำ',
            },
        ],
        keyTakeaways: [
            'FOMO ทำให้ซื้อแพง — อย่าซื้อเพราะทุกคนซื้อ',
            'FUD ทำให้ขายตอนถูก — ตลาดลงเป็นเรื่องปกติ',
            'รู้จักอคติของตัวเอง: Confirmation, Loss Aversion, Anchoring',
            'มีแผน + DCA + อย่าดูพอร์ตบ่อย = ควบคุมอารมณ์ได้',
        ],
        quiz: [
            { question: 'FOMO คืออะไร?', options: ['กลัวตลาดจะพัง', 'กลัวพลาดโอกาส อยากซื้อตามกระแส', 'กลยุทธ์การลงทุน', 'วิธีวิเคราะห์หุ้น'], answer: 1 },
            { question: 'Loss Aversion หมายถึง?', options: ['กลัวตลาด Crash', 'ความเจ็บปวดจากการขาดทุนมากกว่าความสุขจากกำไร', 'ไม่ยอมลงทุนเลย', 'ซื้อหุ้นมากเกินไป'], answer: 1 },
            { question: 'กฎ 24 ชั่วโมง คืออะไร?', options: ['ซื้อขายภายใน 24 ชม.', 'รอ 24 ชม. ก่อนตัดสินใจซื้อ/ขาย', 'ดูราคาทุก 24 ชม.', 'ขายภายใน 24 ชม. หลังซื้อ'], answer: 1 },
        ],
    },
    {
        id: 'taxes-and-fees',
        title: 'ภาษีและค่าธรรมเนียมการลงทุน',
        titleEn: 'Investment Taxes & Fees',
        description: 'เข้าใจภาษีจากกำไรหุ้น เงินปันผล ค่าคอมมิชชัน และวิธีลดค่าใช้จ่ายในการลงทุน',
        category: 'advanced',
        module: 8,
        order: 25,
        difficulty: 'beginner',
        duration: 10,
        icon: '🧾',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
        sections: [
            {
                heading: 'ภาษีจากกำไรหุ้น (Capital Gains Tax)',
                content: '**เมื่อคุณขายหุ้นได้กำไร ต้องเสียภาษี:**\n\n**🇺🇸 หุ้นสหรัฐ:**\n- **Short-term** (ถือน้อยกว่า 1 ปี) = เสียภาษีเหมือนรายได้ปกติ (10-37%)\n- **Long-term** (ถือมากกว่า 1 ปี) = อัตราพิเศษ (0%, 15%, หรือ 20%)\n\n💡 **ถือหุ้นมากกว่า 1 ปี เสียภาษีถูกกว่ามาก!**\n\n**🇹🇭 หุ้นไทย:**\n- กำไรจากการขายหุ้นในตลาด SET **ไม่ต้องเสียภาษี** สำหรับบุคคลธรรมดา\n- แต่กำไรจากหุ้นต่างประเทศ ต้องนำมารวมคำนวณภาษีเงินได้\n\n**ข้อควรจำ:**\n- ขาดทุนสามารถนำมาหักกับกำไรได้ (Tax Loss Harvesting)\n- เก็บหลักฐานการซื้อขายไว้ เพื่อยื่นภาษี',
            },
            {
                heading: 'ภาษีจากเงินปันผล (Dividend Tax)',
                content: '**🇺🇸 หุ้นสหรัฐ:**\n- **Qualified Dividends** = อัตราเดียวกับ Long-term Capital Gains (0-20%)\n- **Non-qualified Dividends** = เสียภาษีเหมือนรายได้ปกติ\n- สำหรับคนไทยที่ลงทุนหุ้นสหรัฐ: จะถูกหัก **Withholding Tax 30%** ณ ที่จ่าย\n- ถ้ายื่น W-8BEN กับโบรกเกอร์ จะลดเหลือ **15%**\n\n💡 **อย่าลืมยื่นแบบ W-8BEN** เพื่อลดภาษีปันผลจากหุ้นสหรัฐ!\n\n**🇹🇭 หุ้นไทย:**\n- เงินปันผลถูกหัก ณ ที่จ่าย **10%**\n- เลือกได้: ให้หักไว้ 10% (Final Tax) หรือนำไปรวมคำนวณภาษีเงินได้\n- ถ้ารายได้ต่ำ อาจได้คืนภาษีถ้าเอาไปรวมยื่น',
            },
            {
                heading: 'ค่าธรรมเนียมการซื้อขาย',
                content: '**ค่าใช้จ่ายที่กินกำไรของคุณ:**\n\n**1. ค่าคอมมิชชัน (Commission):**\n- โบรกเกอร์สหรัฐส่วนใหญ่ = **$0** (Robinhood, Schwab, Fidelity)\n- โบรกเกอร์ไทย = **0.10-0.25%** ต่อครั้ง\n- Interactive Brokers = $0 หรือ $1 ต่อคำสั่ง\n\n**2. Spread:**\n- ส่วนต่างระหว่าง Bid/Ask ก็เป็นค่าใช้จ่ายแฝง\n- หุ้นใหญ่ Spread แคบ หุ้นเล็ก Spread กว้าง\n\n**3. ค่าธรรมเนียมกองทุน (Expense Ratio):**\n- ETF: 0.03-0.20%/ปี (ถูกมาก)\n- กองทุนรวม Active: 0.50-1.50%/ปี\n- ดูเหมือนน้อย แต่สะสม 30 ปี = หลายแสนบาท!\n\n**4. ค่าแปลงสกุลเงิน:**\n- ถ้าลงทุนหุ้นสหรัฐจากไทย = เสีย 0.2-1.0% ค่าแลกเงิน',
            },
            {
                heading: 'วิธีลดค่าใช้จ่ายในการลงทุน',
                content: '**💡 เคล็ดลับลดค่าใช้จ่าย:**\n\n**1. เลือกโบรกเกอร์ค่าคอมมิชชัน $0:**\n- สหรัฐ: Schwab, Fidelity, Robinhood\n- ไทย: เปรียบเทียบค่าคอมฯ ก่อนเลือก\n\n**2. ซื้อ ETF ค่าธรรมเนียมต่ำ:**\n- VOO (0.03%) แทน กองทุนรวม (1%+)\n- ลดค่าใช้จ่าย = เพิ่มผลตอบแทนสุทธิ\n\n**3. อย่าเทรดบ่อย:**\n- ซื้อขายทุกวัน = เสียค่า Spread + ภาษี Short-term\n- ซื้อแล้วถือยาว = ประหยัดกว่ามาก\n\n**4. ถือมากกว่า 1 ปี (หุ้นสหรัฐ):**\n- ภาษี Long-term ถูกกว่า Short-term มาก\n\n**5. Tax Loss Harvesting:**\n- ขายหุ้นที่ขาดทุนเพื่อหักกับกำไร → ลดภาษี\n- ซื้อหุ้นคล้ายกันกลับมาทดแทน\n\n**6. ยื่น W-8BEN:**\n- ลดภาษีหัก ณ ที่จ่ายปันผลจาก 30% เหลือ 15%',
            },
        ],
        keyTakeaways: [
            'ถือหุ้นมากกว่า 1 ปี เสียภาษี Capital Gains น้อยกว่า',
            'ยื่น W-8BEN ลดภาษีปันผลหุ้นสหรัฐจาก 30% เหลือ 15%',
            'เลือก ETF ค่าธรรมเนียมต่ำ อย่าเทรดบ่อย',
            'Expense Ratio ดูน้อยแต่สะสมระยะยาวเป็นเงินมหาศาล',
        ],
        quiz: [
            { question: 'Long-term Capital Gains Tax ใช้เมื่อถือหุ้นนานเท่าไหร่?', options: ['1 เดือน', '6 เดือน', 'มากกว่า 1 ปี', '5 ปี'], answer: 2 },
            { question: 'W-8BEN ช่วยเรื่องอะไร?', options: ['ลดค่าคอมมิชชัน', 'ลดภาษีหัก ณ ที่จ่ายปันผลหุ้นสหรัฐ', 'เปิดบัญชี Margin', 'ซื้อ ETF ราคาถูก'], answer: 1 },
            { question: 'ค่าธรรมเนียม ETF (Expense Ratio) ที่ดีควรเป็นเท่าไหร่?', options: ['ต่ำกว่า 0.20%', '0.50-1.00%', '1.00-2.00%', 'มากกว่า 2.00%'], answer: 0 },
        ],
    },
];
