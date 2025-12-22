import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findLinkBySlug(slug: string) {
  try {
    const link = await prisma.affiliateLink.findFirst({
      where: {
        shortUrl: slug,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        ecommerceBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        productUrls: {
          include: {
            ecommerceBrand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
          ],
        },
      },
    });

    if (!link) {
      console.log(`❌ Link bulunamadı: ${slug}`);
      return;
    }

    console.log('\n✅ Link Bulundu:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📌 ID: ${link.id}`);
    console.log(`📝 Başlık: ${link.title}`);
    console.log(`🔗 Short URL: ${link.shortUrl}`);
    console.log(`🔗 Custom Slug: ${link.customSlug || 'Yok'}`);
    console.log(`📄 Açıklama: ${link.description || 'Yok'}`);
    console.log(`🖼️  Resim: ${link.imageUrl || 'Yok'}`);
    console.log(`📺 YouTube: ${link.youtubeUrl || 'Yok'}`);
    console.log(`✅ Aktif: ${link.isActive ? 'Evet' : 'Hayır'}`);
    console.log(`👆 Tıklanma: ${link.clickCount}`);
    console.log(`🏷️  Etiketler: ${link.tags.length > 0 ? link.tags.join(', ') : 'Yok'}`);
    console.log(`📅 Oluşturulma: ${link.createdAt}`);
    console.log(`📅 Güncellenme: ${link.updatedAt}`);
    
    if (link.user) {
      console.log(`\n👤 Kullanıcı:`);
      console.log(`   - İsim: ${link.user.name}`);
      console.log(`   - Email: ${link.user.email}`);
    }

    if (link.category) {
      console.log(`\n📁 Kategori:`);
      console.log(`   - İsim: ${link.category.name}`);
    }

    if (link.ecommerceBrand) {
      console.log(`\n🏪 E-ticaret Markası (Eski):`);
      console.log(`   - İsim: ${link.ecommerceBrand.name}`);
      console.log(`   - Slug: ${link.ecommerceBrand.slug}`);
    }

    if (link.productUrls && link.productUrls.length > 0) {
      console.log(`\n🛒 Ürün URL'leri (${link.productUrls.length} adet):`);
      link.productUrls.forEach((pu, index) => {
        console.log(`\n   ${index + 1}. ${pu.isPrimary ? '⭐ PRIMARY' : '   '}`);
        console.log(`      URL: ${pu.url}`);
        console.log(`      Marka: ${pu.ecommerceBrand.name}`);
        console.log(`      Sıra: ${pu.order}`);
      });
    } else {
      console.log(`\n🛒 Ürün URL'leri: Yok`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Script argument'inden slug'ı al
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Kullanım: npx tsx scripts/find-link-by-slug.ts <slug>');
  console.error('   Örnek: npx tsx scripts/find-link-by-slug.ts dWr8Sg');
  process.exit(1);
}

findLinkBySlug(slug);

