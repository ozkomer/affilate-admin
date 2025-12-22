-- Add clickCount to CuratedList
ALTER TABLE "CuratedList" 
ADD COLUMN IF NOT EXISTS "clickCount" INTEGER NOT NULL DEFAULT 0;

-- Create ListClick table
CREATE TABLE IF NOT EXISTS "ListClick" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "listId" TEXT NOT NULL,
  "listUrlId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "converted" BOOLEAN NOT NULL DEFAULT false,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ListClick_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CuratedList"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ListClick_listUrlId_fkey" FOREIGN KEY ("listUrlId") REFERENCES "ListUrl"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for ListClick
CREATE INDEX IF NOT EXISTS "ListClick_listId_idx" ON "ListClick"("listId");
CREATE INDEX IF NOT EXISTS "ListClick_listUrlId_idx" ON "ListClick"("listUrlId");
CREATE INDEX IF NOT EXISTS "ListClick_timestamp_idx" ON "ListClick"("timestamp");

-- Add clicks relation to ListUrl (already exists in schema, just ensure it's ready)
-- The relation is handled by Prisma, this is just for reference

