// Simple script to seed UserProfile using fetch API
// Run this from the browser console or create a temporary API endpoint

const profileData = {
  name: "Enes Özen",
  bio: "Teknoloji tutkunu, içerik üreticisi ve en iyi fırsat avcısı.",
  profileImageUrl: "https://yt3.googleusercontent.com/0JmZ86WmvyvkZYLZggr8BBwZanH5TLJFrBQaaujNbHbGxoPWXGQydEk8Yie3MTXCeh9j1qc5KA=s160-c-k-c0x00ffffff-no-rj",
  attentionText: "Gerçek indirim ve fırsatları kaçırmamak için indirim kanallarını takip etmeyi unutma!",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
  tiktokUrl: "https://tiktok.com",
  whatsappUrl: "https://whatsapp.com",
  telegramUrl: "https://t.me",
};

console.log("Profile data:", profileData);
console.log("Use the PUT /api/profile endpoint to create/update this data");

