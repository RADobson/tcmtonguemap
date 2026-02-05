import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return a mock client if env vars are not set (for build time)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set')
    // Return a mock client that throws helpful errors
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [], error: new Error('Supabase not configured') })
          })
        })
      })
    } as any
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
