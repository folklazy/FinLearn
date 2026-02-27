/**
 * Backfill emailVerified for existing credential users who registered
 * before email verification was introduced. Run once after deployment:
 *   npx ts-node --project tsconfig.json scripts/backfill-email-verified.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.user.updateMany({
        where: {
            passwordHash: { not: null },
            emailVerified: null,
        },
        data: {
            emailVerified: new Date(),
        },
    });
    console.log(`Backfilled emailVerified for ${result.count} existing users.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
