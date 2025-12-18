import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Use the same initialization as lib/prisma.ts
const connectionString = process.env.DIRECT_URL || 
  (process.env.DATABASE_URL?.replace('?pgbouncer=true', '').replace('&pgbouncer=true', ''));

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set');
}

const finalConnectionString = connectionString.startsWith('postgresql://') 
  ? connectionString.replace('postgresql://', 'postgres://')
  : connectionString;

const pool = new Pool({
  connectionString: finalConnectionString,
  max: 3,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Check if profile already exists
  const existingProfile = await prisma.userProfile.findFirst();
  
  if (existingProfile) {
    console.log('UserProfile already exists, skipping...');
    return;
  }

  // Create default profile
  const profile = await prisma.userProfile.create({
    data: {
      id: 'profile-1',
      name: 'Enes Özen',
      bio: 'Teknoloji tutkunu, içerik üreticisi ve en iyi fırsat avcısı.',
      profileImageUrl: 'https://yt3.googleusercontent.com/0JmZ86WmvyvkZYLZggr8BBwZanH5TLJFrBQaaujNbHbGxoPWXGQydEk8Yie3MTXCeh9j1qc5KA=s160-c-k-c0x00ffffff-no-rj',
      attentionText: 'Gerçek indirim ve fırsatları kaçırmamak için indirim kanallarını takip etmeyi unutma!',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      tiktokUrl: 'https://tiktok.com',
      whatsappUrl: 'https://whatsapp.com',
      telegramUrl: 'https://t.me',
    },
  });

  console.log('UserProfile created:', profile);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

