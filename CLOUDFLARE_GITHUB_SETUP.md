# Cloudflare Pages GitHub Bağlama Rehberi

## Adımlar

### 1. GitHub'da Repository Oluşturun
- GitHub'da yeni bir repository oluşturun
- Repository adı: `enesozen-affilate` (veya istediğiniz bir isim)

### 2. Projeyi GitHub'a Push Edin
```bash
cd /Users/omer/GitHub/OmBe/Enes.Ozen/affilate-admin
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

### 3. Cloudflare Pages Dashboard'da Bağlayın
1. https://dash.cloudflare.com/ → Pages → `enesozen-affilate` projesi
2. Settings → Connect to Git
3. GitHub'ı seçin ve repository'nizi bağlayın
4. Build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (veya boş bırakın)
5. Environment variables ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

### 4. Deploy
- Cloudflare Pages otomatik olarak build yapacak ve deploy edecek

## Notlar
- Cloudflare Pages, Next.js projelerini GitHub repo bağlayarak otomatik build yaparsa daha iyi çalışır
- Manuel `.next` klasörü deploy'u genellikle çalışmaz
- Environment variables mutlaka eklenmelidir

