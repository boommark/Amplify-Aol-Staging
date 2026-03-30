'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COUNTRIES = [
  'India',
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'Singapore',
  'UAE',
  'Nepal',
  'Sri Lanka',
  'Malaysia',
  'Other',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [display_name, setDisplayName] = useState('')
  const [country, setCountry] = useState('')
  const [cityState, setCityState] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleContinueStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!display_name.trim()) {
      setError('Please enter your display name')
      return
    }
    setError('')
    setStep(2)
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    if (!country) {
      setError('Please select your country')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Build region string: "City/State, Country" or just "Country"
      const region = cityState.trim()
        ? `${cityState.trim()}, ${country}`
        : country

      // Update profiles table with display_name and region
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: display_name.trim(), region })
        .eq('id', user.id)

      if (updateError) {
        setError('Failed to save your preferences. Please try again.')
        return
      }

      // Onboarding complete — go to chat
      router.push('/chat')
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-6 py-2 rounded-lg mb-4"
            style={{ backgroundColor: '#3D8BE8' }}
          >
            <span className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Amplify
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-[#3D8BE8]' : 'bg-gray-200'}`} />
            <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-[#3D8BE8]' : 'bg-gray-200'}`} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Step {step} of 2</p>
        </div>

        <Card className="shadow-lg border-0">
          {step === 1 ? (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Welcome to Amplify!</CardTitle>
                <CardDescription>
                  Let&apos;s set up your profile. What should we call you?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContinueStep1} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Your display name</Label>
                    <Input
                      id="display_name"
                      type="text"
                      value={display_name}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      autoFocus
                      className="focus-visible:ring-[#3D8BE8]"
                    />
                    <p className="text-xs text-gray-400">
                      This is how you&apos;ll appear in the app
                    </p>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#3D8BE8' }}
                    disabled={!display_name.trim()}
                  >
                    Continue
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Your Region</CardTitle>
                <CardDescription>
                  Where do you primarily run workshops?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger id="country" className="focus:ring-[#3D8BE8]">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityState">City / State (optional)</Label>
                    <Input
                      id="cityState"
                      type="text"
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      placeholder="e.g. Seattle, WA"
                      className="focus-visible:ring-[#3D8BE8]"
                    />
                    <p className="text-xs text-gray-400">
                      This helps Amplify tailor content for your audience
                    </p>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#3D8BE8' }}
                    disabled={!country || loading}
                  >
                    {loading ? 'Saving...' : 'Get Started'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => { setStep(1); setError('') }}
                  >
                    Back
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
