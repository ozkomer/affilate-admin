# Supabase Storage Kurulum Rehberi

Bu proje için gerekli Supabase Storage bucket'larını oluşturma adımları.

## Gerekli Bucket'lar

1. **category-avatars** - Kategori avatar resimleri için
2. **list-covers** - Liste kapak resimleri için

## Bucket Oluşturma Adımları

### 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin (ekvmretllehasajyeozh)

### 2. Storage Bucket Oluşturma

#### Kategori Avatar Bucket'ı

1. Sol menüden **Storage** seçeneğine tıklayın
2. **Create bucket** butonuna tıklayın
3. Bucket ayarları:
   - **Name**: `category-avatars`
   - **Public bucket**: ✅ **Açık** (Public URL için gerekli)
   - **File size limit**: 2 MB (veya istediğiniz limit)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. **Create bucket** butonuna tıklayın

#### Liste Kapak Bucket'ı

1. Yine **Storage** > **Create bucket**
2. Bucket ayarları:
   - **Name**: `list-covers`
   - **Public bucket**: ✅ **Açık**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
3. **Create bucket** butonuna tıklayın

### 3. Bucket Policy Ayarları (Opsiyonel - Güvenlik için)

Bucket'ları oluşturduktan sonra, erişim izinlerini ayarlayabilirsiniz.

#### SQL Editor'de Policy Oluşturma

1. Supabase Dashboard'da **SQL Editor** seçeneğine gidin
2. Aşağıdaki SQL'i çalıştırın:

```sql
-- Kategori avatar bucket için policy
CREATE POLICY "Allow authenticated uploads to category-avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-avatars');

CREATE POLICY "Allow public read access to category-avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-avatars');

-- Liste kapak bucket için policy
CREATE POLICY "Allow authenticated uploads to list-covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'list-covers');

CREATE POLICY "Allow public read access to list-covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'list-covers');
```

### 4. Test Etme

Bucket'ları oluşturduktan sonra:

1. Admin panelinde bir kategori oluşturmayı deneyin
2. Kategori avatarı yüklemeyi deneyin
3. Hata alırsanız, browser console'da hata mesajını kontrol edin

## Sorun Giderme

### "Bucket bulunamadı" Hatası

- Supabase Dashboard'da bucket'ın oluşturulduğundan emin olun
- Bucket adının tam olarak doğru olduğundan emin olun (büyük/küçük harf duyarlı)

### "Erişim izni yok" Hatası

- Bucket'ın **Public bucket** olarak işaretlendiğinden emin olun
- Veya yukarıdaki SQL policy'lerini çalıştırın

### "Dosya boyutu aşıldı" Hatası

- Bucket ayarlarında **File size limit** değerini kontrol edin
- Veya daha küçük bir resim yüklemeyi deneyin

## Bucket Yapısı

Oluşturulduktan sonra bucket'lar şu şekilde organize edilir:

```
category-avatars/
  └── avatars/
      └── 1234567890-abc123.jpg

list-covers/
  └── covers/
      └── 1234567890-xyz789.jpg
```


