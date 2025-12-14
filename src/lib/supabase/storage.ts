import { createClient } from './client';

/**
 * Supabase Storage'a dosya yükleme
 * @param file - Yüklenecek dosya
 * @param bucket - Bucket adı (örn: 'list-covers', 'product-images', 'brand-logos')
 * @param path - Dosya yolu (örn: 'list-123/cover.jpg')
 * @returns Yüklenen dosyanın public URL'i
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  try {
    const supabase = createClient();
    
    // Dosyayı yükle
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false, // Aynı dosya varsa hata ver
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Public URL'i al
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Supabase Storage'dan dosya silme
 * @param bucket - Bucket adı
 * @param path - Silinecek dosya yolu
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Dosya boyutunu kontrol et (max 5MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Dosya tipini kontrol et (sadece resim)
 */
export function validateImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(file.type);
}

