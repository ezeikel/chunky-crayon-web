-- Add missing columns to coloring_images if they do not exist
ALTER TABLE "coloring_images"
ADD COLUMN IF NOT EXISTS "alt" TEXT;
ALTER TABLE "coloring_images"
ADD COLUMN IF NOT EXISTS "qrCodeUrl" TEXT;
ALTER TABLE "coloring_images"
ADD COLUMN IF NOT EXISTS "svgUrl" TEXT;
ALTER TABLE "coloring_images"
ADD COLUMN IF NOT EXISTS "tags" TEXT [];
-- Make url column nullable if not already
ALTER TABLE "coloring_images"
ALTER COLUMN "url" DROP NOT NULL;