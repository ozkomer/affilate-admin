import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function showLinks() {
  try {
    const links = await prisma.affiliateLink.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        shortUrl: true,
        originalUrl: true,
        clickCount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (links.length === 0) {
      console.log('Aktif link bulunamadı.');
      return;
    }

    console.log('\n=== MEVCUT LİNKLER (Güncellenmiş Format) ===\n');
    
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   Short URL: ${link.shortUrl}`);
      console.log(`   ❌ Eski Format: https://eneso.cc/l/${link.shortUrl}`);
      console.log(`   ✅ Yeni Format: https://eneso.cc/${link.shortUrl}`);
      console.log(`   Orijinal URL: ${link.originalUrl}`);
      console.log(`   Tıklama: ${link.clickCount}`);
      console.log('');
    });

    console.log('=== ÖZET ===');
    console.log(`Toplam ${links.length} aktif link gösterildi.`);
    console.log('Tüm linkler artık "eneso.cc/[slug]" formatında çalışıyor.');
    console.log('Büyük/küçük harf ayrımı yapılıyor (case-sensitive).\n');
  } catch (error: any) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showLinks();

