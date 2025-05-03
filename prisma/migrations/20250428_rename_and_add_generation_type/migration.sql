ALTER TABLE "coloring_pages"
  RENAME TO "coloring_images";
CREATE TYPE "GenerationType" AS ENUM ('USER', 'DAILY', 'WEEKLY', 'MONTHLY');
ALTER TABLE "coloring_images"
ADD COLUMN "generationType" "GenerationType" NOT NULL DEFAULT 'USER';