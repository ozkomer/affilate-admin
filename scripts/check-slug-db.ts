import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlug(slug: string) {
  try {
    console.log(`\n🔍 Checking slug in database: ${slug}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check AffiliateLink
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

    // Check CuratedList
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

    // Try case-insensitive for AffiliateLink
    const linkCI = await prisma.$queryRaw<Array<{ id: string; title: string; shortUrl: string; isActive: boolean }>>`
      SELECT id, title, "shortUrl", "isActive"
      FROM "AffiliateLink"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (linkCI && linkCI.length > 0) {
      console.log('✅ Found as AFFILIATE LINK (Product) - Case-insensitive:');
      console.log(`   ID: ${linkCI[0].id}`);
      console.log(`   Title: ${linkCI[0].title}`);
      console.log(`   Short URL: ${linkCI[0].shortUrl}`);
      console.log(`   Active: ${linkCI[0].isActive ? 'Yes' : 'No'}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    // Try case-insensitive for CuratedList
    const listCI = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string; shortUrl: string }>>`
      SELECT id, title, slug, "shortUrl"
      FROM "CuratedList"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (listCI && listCI.length > 0) {
      console.log('✅ Found as CURATED LIST - Case-insensitive:');
      console.log(`   ID: ${listCI[0].id}`);
      console.log(`   Title: ${listCI[0].title}`);
      console.log(`   Slug: ${listCI[0].slug}`);
      console.log(`   Short URL: ${listCI[0].shortUrl}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await prisma.$disconnect();
      return;
    }

    console.log('❌ Slug not found in AffiliateLink or CuratedList');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

const slug = process.argv[2] || 'dWr8Sg';
checkSlug(slug);

