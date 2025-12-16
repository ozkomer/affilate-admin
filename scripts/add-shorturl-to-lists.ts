import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Generate short URL slug
function generateShortUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function addShortUrlToLists() {
  try {
    // Get all lists
    const lists = await prisma.curatedList.findMany();

    console.log(`Found ${lists.length} lists without shortUrl`);

    for (const list of lists) {
      // Skip if already has shortUrl
      if (list.shortUrl) {
        console.log(`List "${list.title}" already has shortUrl: ${list.shortUrl}`);
        continue;
      }

      // Generate unique shortUrl
      let shortUrl = generateShortUrl();
      let shortUrlExists = await prisma.affiliateLink.findUnique({
        where: { shortUrl },
      }) || await prisma.curatedList.findUnique({
        where: { shortUrl },
      });

      while (shortUrlExists) {
        shortUrl = generateShortUrl();
        shortUrlExists = await prisma.affiliateLink.findUnique({
          where: { shortUrl },
        }) || await prisma.curatedList.findUnique({
          where: { shortUrl },
        });
      }

      // Update list with shortUrl
      await prisma.curatedList.update({
        where: { id: list.id },
        data: { shortUrl },
      });

      console.log(`Added shortUrl "${shortUrl}" to list "${list.title}"`);
    }

    console.log('✅ All lists updated with shortUrl');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShortUrlToLists();

