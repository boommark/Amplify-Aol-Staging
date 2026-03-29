import { adminClient } from '@/lib/supabase/admin'

export async function assignDefaultRole(userId: string): Promise<void> {
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'teacher' }
  })
  if (error) throw new Error(`Failed to assign default role: ${error.message}`)
}
