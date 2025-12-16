-- Add youtubeUrl column to AffiliateLink table
ALTER TABLE "AffiliateLink" 
ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;

