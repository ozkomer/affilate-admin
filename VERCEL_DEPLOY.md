# Vercel Deployment Rehberi

Bu proje Vercel'de deploy edilmek üzere hazırlanmıştır.

## 🚀 Hızlı Başlangıç

### 1. Vercel Dashboard'dan Deploy

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. **Import Git Repository** → `ozkomer/affilate-admin` repository'sini seçin
3. **Configure Project**:
   - **Framework Preset**: `Next.js` (otomatik algılanır)
   - **Build Command**: `npm run vercel-build` (otomatik kullanılır)
   - **Output Directory**: `.next` (otomatik)
   - **Install Command**: `npm install` (otomatik)
   - **Root Directory**: `/` (veya boş bırakın)

### 2. Environment Variables Ayarlama

Vercel Dashboard'da **Settings** → **Environment Variables** bölümüne gidin ve şu değişkenleri ekleyin:

#### Production Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ekvmretllehasajyeozh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdm1yZXRsbGVoYXNhanllb3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjcwMzcsImV4cCI6MjA3NzE0MzAzN30.pAplh0JiJvCFAbf7qgBz0b6ps2WwsersARtC_MpXfv8
SUPABASE_SERVICE_ROLE_KEY=sb_secret_4Jb1YeyskHSeCRdgBbRfrA_IBbk8wMu
DATABASE_URL=postgresql://postgres.ekvmretllehasajyeozh:Enes-2025--!@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.ekvmretllehasajyeozh:Enes-2025--!@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

**⚠️ Önemli:** 
- Environment variables'ları **Production**, **Preview**, ve **Development** için ayrı ayrı ekleyebilirsiniz
- Şifrelerde özel karakterler varsa URL encode edin (`!` → `%21`)

### 3. Build Ayarları

Vercel otomatik olarak şunları algılar:
- **Framework**: Next.js
- **Build Command**: `npm run vercel-build` (Prisma generate + Next.js build)
- **Node Version**: 20.x (otomatik)

### 4. Deploy

1. **Deploy** butonuna tıklayın
2. İlk build birkaç dakika sürebilir (Prisma generate dahil)
3. Deploy tamamlandıktan sonra projeniz `https://your-project.vercel.app` adresinde yayında olacak

## 📝 Notlar

- **Prisma Client**: Build sırasında otomatik olarak generate edilir (`vercel-build` script'i)
- **API Routes**: Vercel Serverless Functions olarak çalışır
- **Database**: Supabase PostgreSQL bağlantısı production'da da çalışır
- **Environment Variables**: Production, Preview ve Development için ayrı ayrı ayarlanabilir
- **Next.js 16.0.10**: CVE-2025-66478 güvenlik açığı için yamalı sürüm kullanılıyor

## 🔧 Sorun Giderme

### Build Hatası

Eğer build sırasında hata alırsanız:

1. **Prisma generate hatası**: 
   - Node version'ın 20.x olduğundan emin olun
   - `DATABASE_URL` ve `DIRECT_URL` environment variables'larının doğru olduğunu kontrol edin

2. **Environment variable hatası**: 
   - Tüm gerekli environment variable'ların eklendiğini kontrol edin
   - Production, Preview ve Development için ayrı ayrı eklenmiş olabilir

3. **Database connection hatası**: 
   - `DIRECT_URL`'in doğru olduğunu kontrol edin
   - Supabase connection pooler'ın aktif olduğundan emin olun

### Runtime Hatası

1. **Prisma client undefined**: 
   - Build loglarını kontrol edin, `prisma generate` çalıştığından emin olun
   - Environment variables'ların doğru olduğunu kontrol edin

2. **Database connection timeout**: 
   - `DIRECT_URL`'in pooler formatında olduğunu kontrol edin
   - Supabase dashboard'dan connection string'i doğrulayın

## 🔗 Faydalı Linkler

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 🔒 Güvenlik

- **CVE-2025-66478**: Next.js 16.0.10 ile düzeltildi
- **Environment Variables**: Hassas bilgileri asla commit etmeyin
- **Supabase Keys**: Service role key'i sadece server-side kullanın


