import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server-admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin client kullan (Storage işlemleri için daha fazla yetki)
    const adminClient = createAdminClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'uploads';
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Dosya tipini kontrol et (sadece resim)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Dosyayı direkt yüklemeyi dene (bucket kontrolü için)
    // Eğer bucket yoksa veya erişim izni yoksa hata verecek
    // Admin client kullan (service role key ile daha fazla yetki)
    const { data, error } = await adminClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      console.error('Error code:', error.statusCode);
      console.error('Error message:', error.message);
      
      // Daha açıklayıcı hata mesajları
      let errorMessage = error.message;
      let errorDetails = '';
      
      if (error.message?.includes('new row violates row-level security') || error.statusCode === '403') {
        errorMessage = 'Bucket erişim izni yok';
        errorDetails = 'Lütfen Supabase Dashboard\'da Storage > Policies bölümünden bucket için policy oluşturun veya bucket\'ı Public olarak işaretleyin.';
      } else if (error.message?.includes('The resource already exists')) {
        errorMessage = 'Bu dosya zaten mevcut';
        errorDetails = 'Farklı bir dosya seçin veya dosya adını değiştirin.';
      } else if (error.message?.includes('Bucket not found') || error.statusCode === '404') {
        errorMessage = `Bucket bulunamadı: "${bucket}"`;
        errorDetails = `Lütfen Supabase Dashboard'da Storage > Create bucket ile "${bucket}" adında bir bucket oluşturun ve Public olarak işaretleyin.`;
        
        // Mevcut bucket'ları listele (debug için)
        try {
          const { data: buckets } = await adminClient.storage.listBuckets();
          if (buckets && buckets.length > 0) {
            errorDetails += ` Mevcut bucket'lar: ${buckets.map(b => b.name).join(', ')}`;
          }
        } catch (e) {
          // Bucket listesi alınamazsa sessizce devam et
        }
      } else {
        errorDetails = error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: 500 }
      );
    }

    // Public URL'i al (anon client ile - public URL için yeterli)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Upload exception:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

