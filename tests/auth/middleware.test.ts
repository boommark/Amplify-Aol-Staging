import { describe, it, expect } from 'vitest'

describe('Middleware - Route Protection', () => {
  describe('AUTH-06: Unauthenticated redirect', () => {
    it.todo('redirects unauthenticated user to /login from /chat')
    it.todo('allows unauthenticated user to access /login')
    it.todo('allows unauthenticated user to access /auth/callback')
  })

  describe('AUTH-05: Admin route guard', () => {
    it.todo('blocks non-admin user from /admin routes with redirect')
    it.todo('allows admin user to access /admin routes')
  })
})
