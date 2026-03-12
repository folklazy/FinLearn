import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/profile — ดึงข้อมูล profile
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            profile: true,
            sectorPreferences: {
                include: { sector: true },
            },
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...userWithoutHash } = user;
    return NextResponse.json({ user: { ...userWithoutHash, hasPassword: !!passwordHash } });
}

// PUT /api/user/profile — อัปเดต profile
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await req.json();
    const {
        name,
        image,
        displayName,
        experienceLevel,
        primaryGoal,
        riskLevel,
        simulatorStartingCash,
        language,
        displayCurrency,
        emailNotifications,
        sectorIds,
        onboardingStep,
    } = body;

    // ── Input validation ──
    const VALID_EXP = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    const VALID_GOAL = ['LEARN_BASICS', 'VALUE', 'GROWTH', 'DIVIDEND', 'TRADING_EDU'];
    const VALID_RISK = ['LOW', 'MEDIUM', 'HIGH'];
    const VALID_LANG = ['th', 'en'];
    const VALID_CURRENCY = ['THB', 'USD'];

    if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
        return NextResponse.json({ error: 'ชื่อต้องเป็นข้อความไม่เกิน 100 ตัวอักษร' }, { status: 400 });
    }
    if (displayName !== undefined && (typeof displayName !== 'string' || displayName.length > 100)) {
        return NextResponse.json({ error: 'ชื่อแสดงต้องเป็นข้อความไม่เกิน 100 ตัวอักษร' }, { status: 400 });
    }
    if (experienceLevel !== undefined && !VALID_EXP.includes(experienceLevel)) {
        return NextResponse.json({ error: 'ระดับประสบการณ์ไม่ถูกต้อง' }, { status: 400 });
    }
    if (primaryGoal !== undefined && !VALID_GOAL.includes(primaryGoal)) {
        return NextResponse.json({ error: 'เป้าหมายไม่ถูกต้อง' }, { status: 400 });
    }
    if (riskLevel !== undefined && !VALID_RISK.includes(riskLevel)) {
        return NextResponse.json({ error: 'ระดับความเสี่ยงไม่ถูกต้อง' }, { status: 400 });
    }
    if (simulatorStartingCash !== undefined) {
        const cash = Number(simulatorStartingCash);
        if (isNaN(cash) || cash < 1000 || cash > 10_000_000) {
            return NextResponse.json({ error: 'เงินเริ่มต้นต้องอยู่ระหว่าง 1,000 - 10,000,000' }, { status: 400 });
        }
    }
    if (language !== undefined && !VALID_LANG.includes(language)) {
        return NextResponse.json({ error: 'ภาษาไม่ถูกต้อง' }, { status: 400 });
    }
    if (displayCurrency !== undefined && !VALID_CURRENCY.includes(displayCurrency)) {
        return NextResponse.json({ error: 'สกุลเงินไม่ถูกต้อง' }, { status: 400 });
    }
    if (onboardingStep !== undefined && (typeof onboardingStep !== 'number' || onboardingStep < 1 || onboardingStep > 3)) {
        return NextResponse.json({ error: 'onboardingStep ไม่ถูกต้อง' }, { status: 400 });
    }
    if (sectorIds !== undefined && (!Array.isArray(sectorIds) || sectorIds.length > 20)) {
        return NextResponse.json({ error: 'sectorIds ไม่ถูกต้อง' }, { status: 400 });
    }

    // Update user basic info
    if (name !== undefined || image !== undefined) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(image !== undefined && { image }),
            },
        });
    }

    // Upsert profile
    const profileData: Record<string, unknown> = {};
    if (displayName !== undefined) profileData.displayName = displayName;
    if (experienceLevel !== undefined) profileData.experienceLevel = experienceLevel;
    if (primaryGoal !== undefined) profileData.primaryGoal = primaryGoal;
    if (riskLevel !== undefined) profileData.riskLevel = riskLevel;
    if (simulatorStartingCash !== undefined) profileData.simulatorStartingCash = simulatorStartingCash;
    if (language !== undefined) profileData.language = language;
    if (displayCurrency !== undefined) profileData.displayCurrency = displayCurrency;
    if (emailNotifications !== undefined) profileData.emailNotifications = emailNotifications;
    if (onboardingStep !== undefined) profileData.onboardingStep = onboardingStep;

    // Mark onboarding complete if step >= 3
    if (onboardingStep && onboardingStep >= 3) {
        profileData.onboardingCompletedAt = new Date();
    }

    if (Object.keys(profileData).length > 0) {
        // Check required fields for create
        const existing = await prisma.userProfile.findUnique({
            where: { userId },
        });

        if (existing) {
            await prisma.userProfile.update({
                where: { userId },
                data: profileData,
            });
        } else {
            // Creating new profile — use defaults for required fields if not provided
            const nameUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true },
            });
            await prisma.userProfile.create({
                data: {
                    userId,
                    displayName: (profileData.displayName as string) || nameUser?.name || 'ผู้ใช้',
                    experienceLevel: (profileData.experienceLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || 'BEGINNER',
                    primaryGoal: (profileData.primaryGoal as 'LEARN_BASICS' | 'VALUE' | 'GROWTH' | 'DIVIDEND' | 'TRADING_EDU') || 'LEARN_BASICS',
                    ...profileData,
                },
            });
        }
    }

    // Update sector preferences
    if (sectorIds !== undefined && Array.isArray(sectorIds)) {
        await prisma.userSectorPreference.deleteMany({
            where: { userId },
        });

        if (sectorIds.length > 0) {
            await prisma.userSectorPreference.createMany({
                data: sectorIds.map((sectorId: number) => ({
                    userId,
                    sectorId: BigInt(sectorId),
                })),
            });
        }
    }

    // Return updated profile
    const updated = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            profile: true,
            sectorPreferences: {
                include: { sector: true },
            },
        },
    });

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { passwordHash: ph, ...updatedWithoutHash } = updated;
    return NextResponse.json({ user: { ...updatedWithoutHash, hasPassword: !!ph } });
}
