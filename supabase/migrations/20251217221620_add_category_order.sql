-- Add order column to Category table
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- Create index on order column for better performance
CREATE INDEX IF NOT EXISTS "Category_order_idx" ON "Category"("order");

-- Update existing categories with sequential order values based on their current position
-- This ensures existing categories have proper order values
DO $$
DECLARE
  cat RECORD;
  idx INTEGER := 0;
BEGIN
  FOR cat IN SELECT id FROM "Category" ORDER BY "createdAt" ASC
  LOOP
    UPDATE "Category" SET "order" = idx WHERE id = cat.id;
    idx := idx + 1;
  END LOOP;
END $$;

