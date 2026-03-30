import { adminClient } from '@/lib/supabase/admin'

export async function assignDefaultRole(userId: string): Promise<void> {
  // Check if user already has a role (e.g., admin set manually)
  const { data: { user } } = await adminClient.auth.admin.getUserById(userId)
  if (user?.app_metadata?.role) {
    return // Don't overwrite existing role
  }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { ...user?.app_metadata, role: 'teacher' }
  })
  if (error) throw new Error(`Failed to assign default role: ${error.message}`)
}
