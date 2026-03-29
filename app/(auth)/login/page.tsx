'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [deniedEmail, setDeniedEmail] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const access = searchParams.get('access')
    const email = searchParams.get('email')
    if (access === 'denied' && email) {
      setAccessDenied(true)
      setDeniedEmail(decodeURIComponent(email))
    }
  }, [searchParams])

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      setError('')
      const supabase = createClient()
      const origin = window.location.origin
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (signInError) {
        setError('Failed to initiate sign in. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault()
    if (!deniedEmail) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deniedEmail, reason }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Failed to submit request. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Amplify Brand Header */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-6 py-2 rounded-lg mb-4"
            style={{ backgroundColor: '#3D8BE8' }}
          >
            <span className="text-white text-3xl font-bold tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Amplify
            </span>
          </div>
          <p className="text-lg font-medium text-gray-700 mt-2">Your AI Marketing Copilot</p>
          <p className="text-sm text-gray-400 mt-1">by Art of Living</p>
        </div>

        <Card className="shadow-lg border-0">
          {accessDenied ? (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Request Access</CardTitle>
                <CardDescription>
                  Your email is not on the access list yet. Submit a request and we&apos;ll review it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: '#3D8BE8' }}
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">Your request has been submitted</p>
                    <p className="text-gray-500 text-sm mt-1">We&apos;ll reach out to you at {deniedEmail}</p>
                    <Button
                      variant="link"
                      className="mt-4"
                      style={{ color: '#3D8BE8' }}
                      onClick={() => {
                        setAccessDenied(false)
                        setSubmitted(false)
                        router.push('/login')
                      }}
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={deniedEmail}
                        readOnly
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Why do you need access? (optional)</Label>
                      <textarea
                        id="reason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="I'm a teacher in the Delhi region..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full text-white"
                      style={{ backgroundColor: '#3D8BE8' }}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setAccessDenied(false)
                        router.push('/login')
                      }}
                    >
                      Back to login
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  Access your Amplify marketing dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
                  variant="outline"
                >
                  {loading ? (
                    <span className="text-gray-500">Redirecting...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-400 mt-4">
                  Access is restricted to approved Amplify teachers.{' '}
                  <span className="text-gray-500">Not approved yet?</span>{' '}
                  <button
                    type="button"
                    onClick={() => setAccessDenied(true)}
                    className="underline hover:text-gray-700"
                  >
                    Request access
                  </button>
                </p>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-gray-300 mt-6">
          Amplify &mdash; Art of Living Foundation
        </p>
      </div>
    </div>
  )
}
