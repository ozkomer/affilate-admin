-- Add showDirectLinks column to CuratedList table
ALTER TABLE "CuratedList" 
ADD COLUMN IF NOT EXISTS "showDirectLinks" BOOLEAN NOT NULL DEFAULT false;

