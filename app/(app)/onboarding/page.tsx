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

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'International',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [display_name, setDisplayName] = useState('')
  const [region, setRegion] = useState('')
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
    if (!region) {
      setError('Please select your region')
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
                  Which region do you primarily run workshops in?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Select your region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="region" className="focus:ring-[#3D8BE8]">
                        <SelectValue placeholder="Choose a state or region" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      This helps Amplify tailor content for your audience
                    </p>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#3D8BE8' }}
                    disabled={!region || loading}
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
