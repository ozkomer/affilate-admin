# Cloudflare Pages Deployment Rehberi

Bu proje Cloudflare Pages'e deploy edilebilir.

## 🚀 Hızlı Başlangıç

### 1. Cloudflare Dashboard'dan Deploy

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project**
2. **Connect to Git** → GitHub repository'nizi seçin
3. **Configure build**:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (eğer repository root'unda `package.json` varsa) veya `affilate-admin` (eğer proje bir alt klasördeyse)
   
   **⚠️ ÖNEMLİ:** Eğer `package.json` bulunamıyor hatası alıyorsanız:
   - Cloudflare Dashboard → Your Project → **Settings** → **Builds & deployments**
   - **Root directory** alanını kontrol edin
   - Repository yapınıza göre doğru path'i girin (genellikle `/` veya boş bırakın)

### 2. Environment Variables Ayarlama

Cloudflare Pages dashboard'da **Settings** → **Environment variables** bölümüne gidin ve şu değişkenleri ekleyin:

#### Production Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ekvmretllehasajyeozh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdm1yZXRsbGVoYXNhanllb3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjcwMzcsImV4cCI6MjA3NzEwMzAzN30.pAplh0JiJvCFAbf7qgBz0b6ps2WwsersARtC_MpXfv8
SUPABASE_SERVICE_ROLE_KEY=sb_secret_4Jb1YeyskHSeCRdgBbRfrA_IBbk8wMu
DATABASE_URL=postgresql://postgres.ekvmretllehasajyeozh:Enes-2025--!@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.ekvmretllehasajyeozh:Enes-2025--!@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**⚠️ Önemli:** Şifreleri URL encode etmeyi unutmayın:
- `Enes-2025--!` → `Enes-2025--%21` (sadece `!` karakteri encode edilir)

### 3. Build Ayarları

- **Node version**: `20.x` veya üzeri
- **Build command**: `npm run build` (otomatik olarak `prisma generate` çalıştırır)
- **Output directory**: `.next`

### 4. Deploy

1. **Save and Deploy** butonuna tıklayın
2. İlk build birkaç dakika sürebilir
3. Deploy tamamlandıktan sonra projeniz `https://your-project.pages.dev` adresinde yayında olacak

## 📝 Notlar

- **Prisma Client**: Build sırasında otomatik olarak generate edilir (`package.json`'da `build` script'i güncellendi)
- **API Routes**: Cloudflare Pages'de Next.js API routes çalışır (Cloudflare Functions olarak)
- **Database**: Supabase PostgreSQL bağlantısı production'da da çalışır
- **Environment Variables**: Production ve Preview environment'lar için ayrı ayrı ayarlanabilir

## 🔧 Sorun Giderme

### Build Hatası

Eğer build sırasında hata alırsanız:

1. **Prisma generate hatası**: Node version'ın 20.x veya üzeri olduğundan emin olun
2. **Environment variable hatası**: Tüm gerekli environment variable'ların eklendiğini kontrol edin
3. **Database connection hatası**: DIRECT_URL'in doğru olduğunu kontrol edin

### Runtime Hatası

1. **Prisma client undefined**: Build loglarını kontrol edin, `prisma generate` çalıştığından emin olun
2. **Database connection timeout**: DIRECT_URL'in pooler formatında olduğunu kontrol edin

## 🔗 Faydalı Linkler

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)


