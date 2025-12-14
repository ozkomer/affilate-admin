import { createClient } from './client'

/**
 * Client-side: Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Client-side: Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string, rememberMe: boolean = false) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw error
  }

  // Beni hatırla özelliği için cookie'yi işaretle
  if (rememberMe) {
    // Cookie'yi set et (middleware'de kontrol edilecek)
    document.cookie = `rememberMe=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  } else {
    // Beni hatırla seçili değilse cookie'yi sil
    document.cookie = 'rememberMe=; path=/; max-age=0'
  }
  
  return data
}

/**
 * Client-side: Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    throw error
  }
  
  return data
}

