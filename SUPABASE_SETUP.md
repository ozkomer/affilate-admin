# Supabase Kurulum Rehberi

## Proje Bilgileri
- **Supabase URL**: https://ekvmretllehasajyeozh.supabase.co
- **Project Reference**: ekvmretllehasajyeozh

## Gerekli Bilgileri Alma

### 1. Supabase API Keys
1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin
3. **Settings** > **API** bölümüne gidin
4. Şu bilgileri kopyalayın:
   - **Project URL**: `https://ekvmretllehasajyeozh.supabase.co`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` için kullanılacak

### 2. Database Password
1. Supabase Dashboard'da **Settings** > **Database** bölümüne gidin
2. **Connection string** bölümünden şifreyi alın veya
3. **Reset database password** ile yeni bir şifre oluşturun

### 3. .env Dosyasını Güncelleme

`.env` dosyanızı şu şekilde güncelleyin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ekvmretllehasajyeozh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Database (Supabase PostgreSQL)
# [YOUR-PASSWORD] kısmını Supabase database şifrenizle değiştirin
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@ekvmretllehasajyeozh.supabase.co:5432/postgres?schema=public"
```

## Bağlantıyı Test Etme

### Prisma ile Test
```bash
# Prisma Client'ı generate edin
npm run db:generate

# Veritabanı bağlantısını test edin
npm run db:push

# Prisma Studio'yu açın (veritabanını görselleştirmek için)
npm run db:studio
```

### Supabase ile Test
```typescript
// src/app/test/page.tsx gibi bir test sayfası oluşturun
import { createSupabaseServerClient } from '@/lib/supabase'

export default async function TestPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('your_table').select('*')
  
  return <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
}
```

## Sorun Giderme

### Bağlantı Hatası
- DATABASE_URL'deki şifrenin doğru olduğundan emin olun
- Supabase projenizin aktif olduğunu kontrol edin
- Firewall ayarlarını kontrol edin (Supabase'de IP kısıtlaması varsa)

### API Key Hatası
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerinin doğru olduğundan emin olun
- Supabase Dashboard'dan yeni bir key oluşturmayı deneyin


