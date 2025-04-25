"use client"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AdCreativeCarousel } from "@/components/ad-creative-carousel"
import {
  Zap,
  Globe,
  Shield,
  MessageSquare,
  BarChart,
  Users,
  Target,
  Workflow,
  Send,
  BookOpen,
  Quote,
  Laptop,
  Smartphone,
  ArrowRight,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section with Multi-Channel Content Preview */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-light opacity-70"></div>
          <div className="container relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                  Amplify Marketing Suite
                </h1>
                <h2 className="text-2xl sm:text-3xl font-semibold text-blue-600 mt-4">
                  The agentic marketing platform for the Art of Living.
                </h2>
                <p className="text-xl text-gray-600 max-w-lg mt-6">
                  Understand your audience. Curate precise wisdom. Create copy and creative that converts. At warp
                  speed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm"
                    onClick={() => (window.location.href = "/dashboard/campaign-options")}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl shadow-sm">
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 transform transition-all duration-500 hover:shadow-md h-[400px]">
                    <AdCreativeCarousel />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Challenge We Solve */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="flex justify-center">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/problem%20we%20solve-lCEWDPglBQ3SWYxPr0AHyeNbxFKbql.webp"
                        alt="The Challenge We Solve"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">The Challenge We Solve</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Art of Living teachers and marketing teams have been creating content without knowing what truly
                    motivates today's seekers – relying on intuition or recycling past messaging while spending hours on
                    execution.
                  </p>
                  <p className="text-lg text-gray-600">
                    Amplify gives you both cutting-edge market intelligence and powerful creation tools in one platform,
                    designed specifically for The Art of Living community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Complete Marketing Solution */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Your Complete Marketing Solution</h2>
              <p className="text-lg text-gray-600 mb-8">
                Everything you need to create, manage, and optimize your marketing campaigns
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm"
                  onClick={() => (window.location.href = "/dashboard/campaign-options")}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                <div className="rounded-xl bg-blue-50 w-14 h-14 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Detailed Market Insights</h3>
                <p className="text-gray-600 mb-6">
                  Access curated market insights that reveal exactly what motivates your specific audience, presented in
                  a beautiful, actionable format.
                </p>
                <div className="mt-4 relative group">
                  <div className="overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amplify%20screenshot%203-MhGAnCUYg4krqIZ0KIVOtqpHu2ReHN.png"
                      alt="Campaign Insights"
                      width={500}
                      height={300}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-medium">Target specific audiences with precision</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                <div className="rounded-xl bg-purple-50 w-14 h-14 flex items-center justify-center mb-6">
                  <BookOpen className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Automatically Curate Gurudev's Wisdom</h3>
                <p className="text-gray-600 mb-6">
                  Automatically identify, curate, and fetch the most relevant quotes for your audience from Gurudev's
                  wisdom.
                </p>
                <div className="mt-4 relative group">
                  <div className="overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amplify%20screenshot%20gurudev%20quotes-VSIdD1ficSWiAXZXB4KjPsyYoxwtjG.png"
                      alt="Curated Wisdom from Gurudev"
                      width={500}
                      height={300}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-medium">Organized wisdom by topic for easy access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-teal-100">
                <div className="rounded-xl bg-teal-50 w-14 h-14 flex items-center justify-center mb-6">
                  <MessageSquare className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Multi-Channel Made Simple</h3>
                <p className="text-gray-600 mb-6">
                  AI automatically creates high-performing copy for email, social media, WhatsApp, and print materials.
                </p>
                <div className="mt-4 relative group">
                  <div className="overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amplify%20screenshot%201-SpT4p9kZ6V1Wty33NOBrkWh9KbcWwO.png"
                      alt="Multi-Channel Content"
                      width={500}
                      height={300}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-medium">Content optimized for each platform</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                <div className="rounded-xl bg-pink-50 w-14 h-14 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Consistently On-Brand</h3>
                <p className="text-gray-600 mb-6">
                  Ensure Art of Living's authentic voice comes across all channels with wisdom copy and high-end
                  imagery.
                </p>
                <div className="mt-4 relative group">
                  <div className="overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amplify%20Screenshot%202-c89u4XSx8fYi0mHkYuM5FKETc38mvi.png"
                      alt="On-Brand Content"
                      width={500}
                      height={300}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-medium">Consistent messaging across all platforms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Creation Showcase */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Effortless Campaign Creation</h2>
              <p className="text-lg text-gray-600 mb-8">
                Create powerful, targeted campaigns in minutes with our intuitive workflow
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <span className="font-semibold">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Select Your Campaign Type</h3>
                  </div>
                  <p className="text-gray-600 ml-14">
                    Choose from a variety of campaign types tailored to your specific needs, from introductory workshops
                    to special events.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mr-4">
                      <span className="font-semibold">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Enter Your Event Details</h3>
                  </div>
                  <p className="text-gray-600 ml-14">
                    Provide the essential information about your event, including date, location, and target audience.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-teal-100">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 text-teal-600 mr-4">
                      <span className="font-semibold">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Generate Multi-Channel Content</h3>
                  </div>
                  <p className="text-gray-600 ml-14">
                    Our AI automatically creates optimized content for all your marketing channels, saving you hours of
                    work.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl shadow-sm">
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 transform transition-all duration-500 hover:shadow-md">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="p-1">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amplify%20build%20a%20workshop-kyrxPpRe0Z0b1hiRCoCLqf64TEW1h4.png"
                        alt="Campaign Selection Interface"
                        width={600}
                        height={500}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-8">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-3/4 transform transition-all duration-500 hover:shadow-md">
                      <div className="p-1">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amplify%20course%20setup%20wizard-gBB35nzi9rUc7M8ZRmGXUyHqsx9TIk.png"
                          alt="Campaign Setup Wizard"
                          width={500}
                          height={400}
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">How It Works</h2>
            </div>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 overflow-hidden">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-48 h-48">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discover%20waht%20works-LxktPsVVARud38dYB83aidCf6DMWFE.webp"
                        alt="Conduct Market Research"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-full">
                        1
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Conduct Market Research</h3>
                <p className="text-gray-600">
                  Begin with research insights showing what your specific audience truly cares about, revealing proven
                  approaches that drive enrollment.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 overflow-hidden">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-48 h-48">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/create%20with%20confidence-gpiIaBvvuR9wUJxgRNBfIzwFgeAnQj.webp"
                        alt="Curate Gurudev's Wisdom"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-purple-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-full">
                        2
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Curate Gurudev's Wisdom</h3>
                <p className="text-gray-600">
                  Identify and select the most relevant wisdom from Gurudev that resonates with your target audience and
                  campaign goals.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 overflow-hidden">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-48 h-48">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/personalize%20your%20message-E3DXrs9ZirXWCvtuw844bswD3xklqS.webp"
                        alt="Create Channel-Specific Messaging"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-teal-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-full">
                        3
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Create Channel-Specific Messaging</h3>
                <p className="text-gray-600">
                  Develop tailored content for each channel while maintaining perfect brand alignment and messaging
                  consistency.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 overflow-hidden">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-48 h-48">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/publish%20and%20connect-YWxqXEQN0wiSn1Wb9izIgYmlKUHFSq.webp"
                        alt="Generate AI Visuals"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute top-4 right-4 bg-pink-600 text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-full">
                        4
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Generate High-Quality AI Visuals</h3>
                <p className="text-gray-600">
                  Create stunning, channel-optimized visuals using AI to complement your messaging and drive engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Preview Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Multi-Channel Content <span className="text-blue-600">Made Easy</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Preview how your content will look across all platforms before publishing
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="relative rounded-3xl shadow-sm">
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                      <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                        <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                        Mobile Preview
                      </h3>
                      <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-[280px] mx-auto">
                          <div className="h-6 bg-gray-800 rounded-t-2xl flex justify-center items-center">
                            <div className="w-20 h-2 bg-gray-600 rounded-full"></div>
                          </div>
                          <div className="p-2">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amplify%20screenshot%201-SpT4p9kZ6V1Wty33NOBrkWh9KbcWwO.png"
                              alt="Mobile Content Preview"
                              width={280}
                              height={500}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="h-4 bg-gray-100 flex justify-center items-center">
                            <div className="w-10 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-2/3">
                      <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                        <Laptop className="w-5 h-5 mr-2 text-purple-600" />
                        Desktop Preview
                      </h3>
                      <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                          <div className="h-6 bg-gray-200 flex items-center px-2">
                            <div className="flex space-x-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Amplify%20Screenshot%202-c89u4XSx8fYi0mHkYuM5FKETc38mvi.png"
                              alt="Desktop Content Preview"
                              width={600}
                              height={400}
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                      <Quote className="w-5 h-5 mr-2 text-teal-600" />
                      Curated Wisdom Integration
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
                      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="p-4">
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amplify%20screenshot%20gurudev%20quotes-VSIdD1ficSWiAXZXB4KjPsyYoxwtjG.png"
                            alt="Curated Wisdom Integration"
                            width={800}
                            height={400}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started is Easy */}
        <section id="getting-started" className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Getting Started is Easy</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-full bg-purple-50 w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <Target className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="rounded-full bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Select Your Campaign Type</h3>
                <p className="text-gray-600">
                  Pick from workshop promotion, event marketing, Gurudev's tour, or other campaign types.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-teal-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-full bg-teal-50 w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <Workflow className="h-7 w-7 text-teal-600" />
                  </div>
                  <div className="rounded-full bg-teal-600 w-8 h-8 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Follow the Guided Process</h3>
                <p className="text-gray-600">
                  Our intuitive step-by-step workflow handles the complexity while you make the key decisions.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-pink-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-full bg-pink-50 w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <Send className="h-7 w-7 text-pink-600" />
                  </div>
                  <div className="rounded-full bg-pink-600 w-8 h-8 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Launch in Minutes</h3>
                <p className="text-gray-600">
                  Publish your complete campaign across all channels with just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">See the Impact for Every Role</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 relative transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                <div className="absolute -top-6 -right-6">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Teachers & Volunteers</h3>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "I discovered my local audience cares more about stress reduction than spiritual growth. This insight
                  plus Amplify's templates doubled my workshop registrations – all in less time than creating a single
                  flyer used to take."
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 relative transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                <div className="absolute -top-6 -right-6">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white">
                      <BarChart className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">State Marketing Teams</h3>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "We can now localize national campaigns in minutes while leveraging fresh research on what resonates
                  in our region. It's transformed both our efficiency and our results."
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 relative transition-all duration-300 hover:shadow-lg hover:border-teal-100">
                <div className="absolute -top-6 -right-6">
                  <div className="relative rounded-3xl shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white">
                      <Globe className="w-8 h-8 text-teal-600" />
                    </div>
                  </div>
                </div>
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">National Marketing Team</h3>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Coordinating Gurudev's tour promotions is seamless now. We create research-backed messaging once,
                  then every region adapts it while staying perfectly on-brand."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-600 text-white">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to transform both your marketing process and results?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Start creating data-driven campaigns that truly connect with your audience.
                </p>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-full shadow-sm"
                  onClick={() => (window.location.href = "/dashboard/campaign-options")}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="relative rounded-3xl shadow-sm">
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-50 w-64 h-64">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discover%20waht%20works-LxktPsVVARud38dYB83aidCf6DMWFE.webp"
                      alt="Marketing Insights"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
