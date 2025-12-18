-- Create UserProfile table
CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT 'Enes Özen',
  "bio" TEXT,
  "profileImageUrl" TEXT,
  "attentionText" TEXT,
  "instagramUrl" TEXT,
  "youtubeUrl" TEXT,
  "tiktokUrl" TEXT,
  "whatsappUrl" TEXT,
  "telegramUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Insert default profile data
INSERT INTO "UserProfile" (
  "id",
  "name",
  "bio",
  "profileImageUrl",
  "attentionText",
  "instagramUrl",
  "youtubeUrl",
  "tiktokUrl",
  "whatsappUrl",
  "telegramUrl",
  "updatedAt"
) VALUES (
  'profile-1',
  'Enes Özen',
  'Teknoloji tutkunu, içerik üreticisi ve en iyi fırsat avcısı.',
  'https://yt3.googleusercontent.com/0JmZ86WmvyvkZYLZggr8BBwZanH5TLJFrBQaaujNbHbGxoPWXGQydEk8Yie3MTXCeh9j1qc5KA=s160-c-k-c0x00ffffff-no-rj',
  'Gerçek indirim ve fırsatları kaçırmamak için indirim kanallarını takip etmeyi unutma!',
  'https://instagram.com',
  'https://youtube.com',
  'https://tiktok.com',
  'https://whatsapp.com',
  'https://t.me',
  CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

