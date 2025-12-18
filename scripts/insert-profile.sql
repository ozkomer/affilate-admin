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
  "createdAt",
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
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "bio" = EXCLUDED."bio",
  "profileImageUrl" = EXCLUDED."profileImageUrl",
  "attentionText" = EXCLUDED."attentionText",
  "instagramUrl" = EXCLUDED."instagramUrl",
  "youtubeUrl" = EXCLUDED."youtubeUrl",
  "tiktokUrl" = EXCLUDED."tiktokUrl",
  "whatsappUrl" = EXCLUDED."whatsappUrl",
  "telegramUrl" = EXCLUDED."telegramUrl",
  "updatedAt" = CURRENT_TIMESTAMP;

