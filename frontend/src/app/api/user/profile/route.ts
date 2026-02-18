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
            passwordHash: false,
            profile: true,
            sectorPreferences: {
                include: { sector: true },
            },
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
}

// PUT /api/user/profile — อัปเดต profile
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Update user basic info
    if (name !== undefined || image !== undefined) {
        await prisma.user.update({
            where: { id: session.user.id },
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
            where: { userId: session.user.id },
        });

        if (existing) {
            await prisma.userProfile.update({
                where: { userId: session.user.id },
                data: profileData,
            });
        } else {
            // Creating new profile — require mandatory fields
            if (!profileData.displayName || !profileData.experienceLevel || !profileData.primaryGoal) {
                return NextResponse.json(
                    { error: 'displayName, experienceLevel, primaryGoal are required' },
                    { status: 400 },
                );
            }
            await prisma.userProfile.create({
                data: {
                    userId: session.user.id,
                    displayName: profileData.displayName as string,
                    experienceLevel: profileData.experienceLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                    primaryGoal: profileData.primaryGoal as 'LEARN_BASICS' | 'VALUE' | 'GROWTH' | 'DIVIDEND' | 'TRADING_EDU',
                    ...profileData,
                },
            });
        }
    }

    // Update sector preferences
    if (sectorIds !== undefined && Array.isArray(sectorIds)) {
        await prisma.userSectorPreference.deleteMany({
            where: { userId: session.user.id },
        });

        if (sectorIds.length > 0) {
            await prisma.userSectorPreference.createMany({
                data: sectorIds.map((sectorId: number) => ({
                    userId: session.user.id,
                    sectorId: BigInt(sectorId),
                })),
            });
        }
    }

    // Return updated profile
    const updated = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            profile: true,
            sectorPreferences: {
                include: { sector: true },
            },
        },
    });

    return NextResponse.json({ user: updated });
}
