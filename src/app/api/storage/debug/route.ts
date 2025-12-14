import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server-admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin client ile bucket listesi al (daha fazla yetki)
    const adminClient = createAdminClient();
    const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json(
        { 
          error: 'Bucket listesi alınamadı', 
          details: bucketsError.message 
        },
        { status: 500 }
      );
    }

    // Her bucket için detaylı bilgi
    const bucketDetails = await Promise.all(
      (buckets || []).map(async (bucket) => {
        // Bucket içindeki dosyaları listele (ilk 5) - admin client ile
        const { data: files } = await adminClient.storage
          .from(bucket.name)
          .list('', { limit: 5 });

        return {
          name: bucket.name,
          id: bucket.id,
          public: bucket.public,
          createdAt: bucket.created_at,
          fileCount: files?.length || 0,
        };
      })
    );

    return NextResponse.json({
      buckets: bucketDetails,
      total: bucketDetails.length,
      required: ['category-avatars', 'list-covers'],
      missing: ['category-avatars', 'list-covers'].filter(
        req => !bucketDetails.some(b => b.name === req)
      ),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint hatası', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

