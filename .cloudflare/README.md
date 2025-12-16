# Cloudflare Pages Deployment

Bu proje Cloudflare Pages'e deploy edilebilir.

## Deployment Adımları

### 1. Cloudflare Dashboard'dan Deploy

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → Create a project
2. GitHub repository'nizi bağlayın
3. Build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (veya proje root'u)

### 2. Environment Variables

Cloudflare Pages dashboard'da şu environment variable'ları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://ekvmretllehasajyeozh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_url_here
```

### 3. Build Settings

- **Node version**: 20.x veya üzeri
- **Build command**: `npm run build`
- **Output directory**: `.next`

### 4. Prisma Generate

Build sırasında Prisma client generate edilmesi gerekiyor. `package.json`'da `build` script'ine `prisma generate` eklenmeli.

## Notlar

- Cloudflare Pages, Next.js'in static export'unu destekler
- API routes çalışır (Cloudflare Functions olarak)
- Prisma client build sırasında generate edilmelidir



