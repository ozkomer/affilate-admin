import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Running CustomLink migration...');

  try {
    // Create CustomLink table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomLink" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "targetUrl" TEXT NOT NULL,
        "shortUrl" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "userId" TEXT NOT NULL,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "CustomLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log('✅ CustomLink table created');

    // Create CustomLinkClick table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomLinkClick" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "customLinkId" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "referrer" TEXT,
        "country" TEXT,
        "city" TEXT,
        "device" TEXT,
        "browser" TEXT,
        "converted" BOOLEAN NOT NULL DEFAULT false,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "CustomLinkClick_customLinkId_fkey" FOREIGN KEY ("customLinkId") REFERENCES "CustomLink"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log('✅ CustomLinkClick table created');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomLink_userId_idx" ON "CustomLink"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomLink_shortUrl_idx" ON "CustomLink"("shortUrl");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomLink_isActive_idx" ON "CustomLink"("isActive");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomLinkClick_customLinkId_idx" ON "CustomLinkClick"("customLinkId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomLinkClick_timestamp_idx" ON "CustomLinkClick"("timestamp");
    `);

    console.log('✅ Indexes created');
    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

