"use client"

import { useState } from "react"
import { Instagram, Facebook, Globe, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChannelConnectionWizardProps {
  channel: string
}

export function ChannelConnectionWizard({ channel }: ChannelConnectionWizardProps) {
  const [step, setStep] = useState<"connect" | "configure" | "success">("connect")
  const [connecting, setConnecting] = useState(false)

  const getChannelIcon = () => {
    switch (channel) {
      case "instagram":
        return <Instagram className="h-5 w-5 text-secondary" />
      case "facebook":
        return <Facebook className="h-5 w-5 text-accent" />
      case "website":
        return <Globe className="h-5 w-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const getChannelName = () => {
    return channel.charAt(0).toUpperCase() + channel.slice(1)
  }

  const handleConnect = () => {
    setConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setConnecting(false)
      setStep("configure")
    }, 2000)
  }

  const handleConfigure = () => {
    setStep("success")
  }

  return (
    <Card className="border-border/40 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getChannelIcon()}
          {getChannelName()} Channel Setup
        </CardTitle>
        <CardDescription>Connect and configure your {getChannelName().toLowerCase()} account</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "connect" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">{getChannelIcon()}</div>
              <h3 className="text-lg font-medium mb-2">Connect Your {getChannelName()} Account</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Connect your {getChannelName()} account to publish content directly from Amplify Marketing Suite.
              </p>
              <Button className="gap-2" onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Connect {getChannelName()}
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Why connect your {getChannelName()} account?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Publish content directly from Amplify</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Schedule posts in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Track performance metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Manage all your channels in one place</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === "configure" && (
          <div className="space-y-6">
            <div className="p-4 border border-accent/20 rounded-lg bg-accent/5 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-medium">Successfully Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    Your {getChannelName()} account has been connected successfully
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configure {getChannelName()} Settings</h3>

              {channel === "instagram" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-account">Instagram Account</Label>
                    <Input id="instagram-account" defaultValue="@artofliving" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram-hashtags">Default Hashtags</Label>
                    <Input id="instagram-hashtags" defaultValue="#artofliving #meditation #yoga #wellness" />
                  </div>
                </div>
              )}

              {channel === "facebook" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook-page">Facebook Page</Label>
                    <Input id="facebook-page" defaultValue="Art of Living Foundation" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook-privacy">Default Privacy Setting</Label>
                    <select
                      id="facebook-privacy"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              )}

              {channel === "website" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Website URL</Label>
                    <Input id="website-url" defaultValue="https://www.artofliving.org" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website-api">API Key</Label>
                    <Input id="website-api" type="password" defaultValue="••••••••••••••••" />
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleConfigure}>
                Save Configuration
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-accent/10 p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2">{getChannelName()} Channel Ready</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your {getChannelName()} channel is now fully configured and ready to use.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">Test Connection</Button>
                <Button>View Channel</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Next Steps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                  <span>Create and schedule your first post</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Configure audience targeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Set up performance tracking</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
