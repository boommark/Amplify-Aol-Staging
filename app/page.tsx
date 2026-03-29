import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Root page: redirect to /chat if authenticated, otherwise to /login
export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  } else {
    redirect('/login')
  }
}
