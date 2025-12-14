import dotenv from 'dotenv'
import { createAdminClient } from '../src/lib/supabase/server-admin'

// Load environment variables
dotenv.config({ path: '.env' })

async function createUser() {
  const supabase = createAdminClient()

  // Kullanıcı bilgileri
  const email = 'admin@enesozen.com'
  const password = 'Admin123!'
  const userMetadata = {
    full_name: 'Admin User',
  }

  try {
    // Kullanıcı oluştur
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email'i otomatik onayla
      user_metadata: userMetadata,
    })

    if (error) {
      console.error('Kullanıcı oluşturma hatası:', error)
      return
    }

    console.log('✅ Kullanıcı başarıyla oluşturuldu!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', data.user?.id)
  } catch (err) {
    console.error('Hata:', err)
  }
}

createUser()

