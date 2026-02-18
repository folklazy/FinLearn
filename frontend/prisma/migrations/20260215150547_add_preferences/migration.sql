-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "display_currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'th';
