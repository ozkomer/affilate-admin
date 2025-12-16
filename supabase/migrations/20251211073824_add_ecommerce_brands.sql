-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "supabaseUserId" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Category table
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create EcommerceBrand table
CREATE TABLE IF NOT EXISTS "EcommerceBrand" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "logo" TEXT,
  "color" TEXT,
  "website" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for EcommerceBrand
CREATE INDEX IF NOT EXISTS "EcommerceBrand_slug_idx" ON "EcommerceBrand"("slug");
CREATE INDEX IF NOT EXISTS "EcommerceBrand_isActive_idx" ON "EcommerceBrand"("isActive");

-- Create AffiliateLink table
CREATE TABLE IF NOT EXISTS "AffiliateLink" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "originalUrl" TEXT NOT NULL,
  "shortUrl" TEXT NOT NULL UNIQUE,
  "customSlug" TEXT UNIQUE,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT,
  "ecommerceBrandId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "tags" TEXT[],
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for AffiliateLink
CREATE INDEX IF NOT EXISTS "AffiliateLink_userId_idx" ON "AffiliateLink"("userId");
CREATE INDEX IF NOT EXISTS "AffiliateLink_categoryId_idx" ON "AffiliateLink"("categoryId");
CREATE INDEX IF NOT EXISTS "AffiliateLink_ecommerceBrandId_idx" ON "AffiliateLink"("ecommerceBrandId");
CREATE INDEX IF NOT EXISTS "AffiliateLink_shortUrl_idx" ON "AffiliateLink"("shortUrl");
CREATE INDEX IF NOT EXISTS "AffiliateLink_isActive_idx" ON "AffiliateLink"("isActive");

-- Create Click table
CREATE TABLE IF NOT EXISTS "Click" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "linkId" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "converted" BOOLEAN NOT NULL DEFAULT false,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Click
CREATE INDEX IF NOT EXISTS "Click_linkId_idx" ON "Click"("linkId");
CREATE INDEX IF NOT EXISTS "Click_timestamp_idx" ON "Click"("timestamp");

-- Add foreign key constraints
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AffiliateLink" ADD CONSTRAINT "AffiliateLink_ecommerceBrandId_fkey" FOREIGN KEY ("ecommerceBrandId") REFERENCES "EcommerceBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Click" ADD CONSTRAINT "Click_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "AffiliateLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;



