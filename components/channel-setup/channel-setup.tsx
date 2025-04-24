"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Mail, Instagram, Facebook, Globe, CheckCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChannelSetupHeader } from "./channel-setup-header"
import { ProgressIndicator } from "../insight-studio/progress-indicator"
import { ChannelConnectionWizard } from "./channel-connection-wizard"
import { AudienceGroupManager } from "./audience-group-manager"

export function ChannelSetup() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("channels")
  const [activeChannel, setActiveChannel] = useState("email")

  const handleContinue = () => {
    router.push("/dashboard/analytics")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      <ChannelSetupHeader />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            className="mb-6 gap-1.5 text-muted-foreground rounded-xl h-11"
            onClick={() => router.push("/dashboard/creation-forge")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Creation Forge
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-secondary-800">Channel Setup</h1>
            <p className="mt-1 text-muted-foreground">Configure your distribution channels and audience groups</p>
          </div>

          <ProgressIndicator currentStage="distribute" />

          <Tabs defaultValue="channels" className="mt-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="mt-6 space-y-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <Button
                  variant={activeChannel === "email" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setActiveChannel("email")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant={activeChannel === "instagram" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setActiveChannel("instagram")}
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
                <Button
                  variant={activeChannel === "facebook" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setActiveChannel("facebook")}
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant={activeChannel === "website" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setActiveChannel("website")}
                >
                  <Globe className="h-4 w-4" />
                  Website
                </Button>
              </div>

              {activeChannel === "email" && (
                <Card className="border-border/40 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Channel Configuration
                    </CardTitle>
                    <CardDescription>Configure your email marketing settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-accent/20 rounded-lg bg-accent/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div>
                          <h3 className="font-medium">Connected to Mailchimp</h3>
                          <p className="text-sm text-muted-foreground">
                            Your email provider is connected and ready to use
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Settings</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sender-name">Sender Name</Label>
                          <Input id="sender-name" defaultValue="Art of Living Foundation" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sender-email">Sender Email</Label>
                          <Input id="sender-email" defaultValue="events@artofliving.org" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reply-to">Reply-To Email</Label>
                        <Input id="reply-to" defaultValue="support@artofliving.org" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">Track Email Opens</h4>
                          <p className="text-xs text-muted-foreground">Track when recipients open your emails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">Track Link Clicks</h4>
                          <p className="text-xs text-muted-foreground">
                            Track when recipients click links in your emails
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">Send Test Email</h4>
                          <p className="text-xs text-muted-foreground">
                            Send a test email to verify your configuration
                          </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Send className="h-4 w-4" />
                          Send Test
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Lists</h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <h4 className="font-medium">Main Newsletter</h4>
                            <p className="text-xs text-muted-foreground">12,450 subscribers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <h4 className="font-medium">Event Attendees</h4>
                            <p className="text-xs text-muted-foreground">3,280 subscribers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                          <div>
                            <h4 className="font-medium">Workshop Graduates</h4>
                            <p className="text-xs text-muted-foreground">5,120 subscribers</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeChannel !== "email" && <ChannelConnectionWizard channel={activeChannel} />}
            </TabsContent>

            <TabsContent value="audience" className="mt-6">
              <AudienceGroupManager />
            </TabsContent>
          </Tabs>

          <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-white/80 backdrop-blur-md p-5 shadow-md">
            <Button
              className="w-full max-w-md gap-1.5 h-12 rounded-xl bg-primary hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={handleContinue}
            >
              Continue to Analytics
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
