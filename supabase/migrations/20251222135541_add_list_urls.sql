-- Create ListUrl table
CREATE TABLE IF NOT EXISTS "ListUrl" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "listId" TEXT NOT NULL,
  "ecommerceBrandId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "ListUrl_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CuratedList"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ListUrl_ecommerceBrandId_fkey" FOREIGN KEY ("ecommerceBrandId") REFERENCES "EcommerceBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ListUrl_listId_idx" ON "ListUrl"("listId");
CREATE INDEX IF NOT EXISTS "ListUrl_ecommerceBrandId_idx" ON "ListUrl"("ecommerceBrandId");
CREATE INDEX IF NOT EXISTS "ListUrl_isPrimary_idx" ON "ListUrl"("isPrimary");

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "ListUrl_listId_ecommerceBrandId_key" ON "ListUrl"("listId", "ecommerceBrandId");

