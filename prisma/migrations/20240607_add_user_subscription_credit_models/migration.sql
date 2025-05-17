-- Create enums if they do not exist
DO $$ BEGIN CREATE TYPE "PlanName" AS ENUM ('CRAYON', 'RAINBOW', 'MASTERPIECE', 'STUDIO');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'INCOMPLETE',
  'PAST_DUE',
  'UNPAID',
  'TRIALING'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE "CreditTransactionType" AS ENUM (
  'PURCHASE',
  'GENERATION',
  'BONUS',
  'REFUND',
  'ADJUSTMENT'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "stripeCustomerId" TEXT,
  "credits" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT UNIQUE NOT NULL,
  "planName" "PlanName" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
-- Create CreditTransaction table
CREATE TABLE IF NOT EXISTS "CreditTransaction" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" "CreditTransactionType" NOT NULL,
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
-- Add userId column to coloring_images if not exists
ALTER TABLE "coloring_images"
ADD COLUMN IF NOT EXISTS "userId" TEXT;
-- Add foreign key constraint for userId
DO $$ BEGIN
ALTER TABLE "coloring_images"
ADD CONSTRAINT coloring_images_userId_fkey FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE
SET NULL;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;