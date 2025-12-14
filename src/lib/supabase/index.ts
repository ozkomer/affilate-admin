// Export Supabase clients (client-side only)
export { createClient } from './client'
export { createClient as createSupabaseClient } from './client' // Alias for backward compatibility

// Export client-side auth helpers
export { signInWithEmail, signUpWithEmail, signOut } from './auth-helpers-client'

// NOTE: Server-side exports are not included here to avoid importing server code in client components
// For server-side usage, import directly from:
// - './server' for createSupabaseServerClient
// - './server-admin' for createAdminClient
// - './auth-helpers-server' for getCurrentUser, getCurrentSession

