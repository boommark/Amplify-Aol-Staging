import { createClient } from '@/lib/supabase/server'

export async function checkEmailAllowlist(email: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('allowed_emails')
    .select('email')
    .eq('email', email.toLowerCase())
    .single()
  return !!data
}
