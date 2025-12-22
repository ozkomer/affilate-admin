import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlugType(slug: string) {
  try {
    console.log(`\n🔍 Checking slug: ${slug}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check in AffiliateLink
    const link = await prisma.affiliateLink.findFirst({
      where: {
        shortUrl: slug,
      },
      select: {
        id: true,
        title: true,
        shortUrl: true,
        isActive: true,
      },
    });

    if (link) {
      console.log('✅ Found as AFFILIATE LINK (Product):');
      console.log(`   ID: ${link.id}`);
      console.log(`   Title: ${link.title}`);
      console.log(`   Short URL: ${link.shortUrl}`);
      console.log(`   Active: ${link.isActive ? 'Yes' : 'No'}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    // Check in CuratedList
    const list = await prisma.curatedList.findFirst({
      where: {
        shortUrl: slug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortUrl: true,
      },
    });

    if (list) {
      console.log('✅ Found as CURATED LIST:');
      console.log(`   ID: ${list.id}`);
      console.log(`   Title: ${list.title}`);
      console.log(`   Slug: ${list.slug}`);
      console.log(`   Short URL: ${list.shortUrl}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    // Try case-insensitive search for AffiliateLink
    const linkCaseInsensitive = await prisma.$queryRaw<Array<{ id: string; title: string; shortUrl: string; isActive: boolean }>>`
      SELECT id, title, "shortUrl", "isActive"
      FROM "AffiliateLink"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (linkCaseInsensitive && linkCaseInsensitive.length > 0) {
      console.log('✅ Found as AFFILIATE LINK (Product) - Case-insensitive match:');
      console.log(`   ID: ${linkCaseInsensitive[0].id}`);
      console.log(`   Title: ${linkCaseInsensitive[0].title}`);
      console.log(`   Short URL: ${linkCaseInsensitive[0].shortUrl}`);
      console.log(`   Active: ${linkCaseInsensitive[0].isActive ? 'Yes' : 'No'}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    // Try case-insensitive search for CuratedList
    const listCaseInsensitive = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string; shortUrl: string }>>`
      SELECT id, title, slug, "shortUrl"
      FROM "CuratedList"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (listCaseInsensitive && listCaseInsensitive.length > 0) {
      console.log('✅ Found as CURATED LIST - Case-insensitive match:');
      console.log(`   ID: ${listCaseInsensitive[0].id}`);
      console.log(`   Title: ${listCaseInsensitive[0].title}`);
      console.log(`   Slug: ${listCaseInsensitive[0].slug}`);
      console.log(`   Short URL: ${listCaseInsensitive[0].shortUrl}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    console.log('❌ Slug not found in AffiliateLink or CuratedList');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Script argument'inden slug'ı al
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Kullanım: npx tsx scripts/check-slug-type.ts <slug>');
  console.error('   Örnek: npx tsx scripts/check-slug-type.ts dWr8Sg');
  process.exit(1);
}

checkSlugType(slug);

