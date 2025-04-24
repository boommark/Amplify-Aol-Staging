"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Mail, Instagram, Facebook, Monitor, Smartphone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MarketingContentProps {
  id: string
}

interface MarketingData {
  id: string
  name: string
  course: string
  date: string
  location: string
  audience: string
  imageUrl: string

  // Topic captions
  topic1: string
  topic2: string
  topic3: string

  // Topic 1 content
  topic1WhatsAppImage: string
  topic1WhatsAppMessage: string
  topic1FacebookImage: string
  topic1FacebookPost: string
  topic1InstagramImage: string
  topic1InstagramPost: string
  topic1EmailImage: string
  topic1Email: string

  // Topic 2 content
  topic2WhatsAppImage: string
  topic2WhatsAppMessage: string
  topic2FacebookImage: string
  topic2FacebookPost: string
  topic2InstagramImage: string
  topic2InstagramPost: string
  topic2EmailImage: string
  topic2Email: string

  // Topic 3 content
  topic3WhatsAppImage: string
  topic3WhatsAppMessage: string
  topic3FacebookImage: string
  topic3FacebookPost: string
  topic3InstagramImage: string
  topic3InstagramPost: string
  topic3EmailImage: string
  topic3Email: string

  rawFields?: Record<string, any>
}

interface PhoneFrameProps {
  children: React.ReactNode
  title: string
  icon: React.ReactNode
}

function PhoneFrame({ children, title, icon }: PhoneFrameProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2 text-slate-700">
        {icon}
        <span className="ml-2 font-medium">{title}</span>
      </div>
      <div className="border-[12px] border-white rounded-[36px] overflow-hidden shadow-xl bg-white max-w-[340px] w-full">
        <div className="relative w-full h-[520px] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

interface DesktopFrameProps {
  children: React.ReactNode
  title: string
  icon: React.ReactNode
}

function DesktopFrame({ children, title, icon }: DesktopFrameProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2 text-slate-700">
        {icon}
        <span className="ml-2 font-medium">{title}</span>
      </div>
      <div className="rounded-lg overflow-hidden shadow-xl bg-gray-800 max-w-[640px] w-full">
        {/* Mac-like top bar */}
        <div className="bg-gray-800 h-6 flex items-center px-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        {/* Browser-like address bar */}
        <div className="bg-gray-100 h-8 flex items-center px-3">
          <div className="bg-white rounded-md h-6 w-full flex items-center px-2 text-xs text-gray-500">
            https://artofliving.org
          </div>
        </div>
        <div className="relative w-full h-[480px] overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  )
}

interface WhatsAppFrameProps {
  image: string
  message: string
  isDesktop?: boolean
}

function WhatsAppFrame({ image, message, isDesktop = false }: WhatsAppFrameProps) {
  const FrameComponent = isDesktop ? DesktopFrame : PhoneFrame

  return (
    <FrameComponent title="WhatsApp" icon={<MessageSquare className="h-5 w-5 text-green-500" />}>
      {isDesktop ? (
        <div className="bg-[#f0f2f5] h-full flex flex-col">
          <div className="bg-[#00a884] h-[108px] w-full"></div>
          <div className="flex h-full -mt-6 px-4">
            <div className="bg-white w-[30%] rounded-t-lg shadow-md">
              <div className="p-3 border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">Art of Living</p>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center py-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="ml-3">
                    <p className="font-medium">Recipient</p>
                    <p className="text-xs text-gray-500">Last seen today</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-[#efeae2] rounded-t-lg shadow-md ml-1 p-4">
              <div className="flex flex-col space-y-3">
                <div className="bg-white rounded-lg p-3 ml-auto max-w-[80%] shadow-sm">
                  <p>Hi! I wanted to share this with you.</p>
                  <p className="text-xs text-gray-500 text-right">10:30 AM</p>
                </div>

                <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                  <p>What is it about?</p>
                  <p className="text-xs text-gray-500 text-right">10:31 AM</p>
                </div>

                <div className="bg-[#d9fdd3] rounded-lg p-3 ml-auto max-w-[80%] shadow-sm">
                  {image && (
                    <div className="relative w-full h-48 mb-3 rounded-md overflow-hidden">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt="WhatsApp image"
                        fill
                        className="object-cover"
                        unoptimized={!image.startsWith("/")}
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message}</p>
                  <p className="text-xs text-gray-500 text-right">10:32 AM ✓✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#e5ddd5] h-full p-3">
          <div className="flex flex-col space-y-3">
            <div className="bg-white rounded-lg p-3 ml-auto max-w-[80%] shadow-sm">
              <p className="text-sm">Hi! I wanted to share this with you.</p>
              <p className="text-[10px] text-gray-500 text-right">10:30 AM</p>
            </div>

            <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
              <p className="text-sm">What is it about?</p>
              <p className="text-[10px] text-gray-500 text-right">10:31 AM</p>
            </div>

            <div className="bg-[#dcf8c6] rounded-lg p-3 ml-auto max-w-[80%] shadow-sm">
              {image && (
                <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="WhatsApp image"
                    fill
                    className="object-cover"
                    unoptimized={!image.startsWith("/")}
                  />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message}</p>
              <p className="text-[10px] text-gray-500 text-right">10:32 AM ✓✓</p>
            </div>
          </div>
        </div>
      )}
    </FrameComponent>
  )
}

interface EmailFrameProps {
  image: string
  content: string
  isDesktop?: boolean
}

function EmailFrame({ image, content, isDesktop = false }: EmailFrameProps) {
  // Extract subject line (first line) and body
  const lines = content.split("\n")
  const subject = lines[0] || "No Subject"
  const body = lines.slice(1).join("\n")

  const FrameComponent = isDesktop ? DesktopFrame : PhoneFrame

  return (
    <FrameComponent title="Email" icon={<Mail className="h-5 w-5 text-blue-500" />}>
      {isDesktop ? (
        <div className="bg-gray-100 h-full flex">
          {/* Email sidebar */}
          <div className="w-[200px] bg-gray-50 border-r p-3">
            <div className="bg-blue-600 text-white rounded-md py-2 px-4 text-center mb-4">Compose</div>
            <div className="space-y-1">
              <div className="flex items-center px-3 py-2 bg-blue-100 rounded-md">
                <span className="font-medium text-blue-800">Inbox</span>
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">3</span>
              </div>
              <div className="flex items-center px-3 py-2 hover:bg-gray-200 rounded-md">
                <span>Sent</span>
              </div>
              <div className="flex items-center px-3 py-2 hover:bg-gray-200 rounded-md">
                <span>Drafts</span>
              </div>
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 bg-white">
            <div className="border-b p-4">
              <h2 className="text-xl font-bold">{subject}</h2>
              <div className="flex items-center mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  A
                </div>
                <div className="ml-2">
                  <p className="font-medium">Art of Living</p>
                  <p className="text-xs text-gray-500">info@artofliving.org</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {image && (
                <div className="relative w-full h-60 mb-4 rounded-md overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Email banner"
                    fill
                    className="object-cover"
                    unoptimized={!image.startsWith("/")}
                  />
                </div>
              )}
              <div className="prose max-w-none whitespace-pre-wrap">{body}</div>
              <div className="mt-6 pt-4 border-t text-sm text-gray-600">
                <p className="font-medium">Art of Living Foundation</p>
                <p>www.artofliving.org</p>
                <p className="mt-2 text-xs text-gray-500">
                  This email was sent to you because you signed up for our newsletter.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white h-full">
          <div className="border-b p-3 bg-gray-50">
            <p className="font-medium text-sm">Subject: {subject}</p>
            <p className="text-xs text-gray-500">From: Art of Living &lt;info@artofliving.org&gt;</p>
            <p className="text-xs text-gray-500">To: Recipient</p>
          </div>
          <div className="p-3">
            {image && (
              <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Email banner"
                  fill
                  className="object-cover"
                  unoptimized={!image.startsWith("/")}
                />
              </div>
            )}
            <div className="text-sm whitespace-pre-wrap">{body}</div>
            <div className="mt-4 text-xs text-gray-500 border-t pt-2">
              <p>Art of Living Foundation</p>
              <p>www.artofliving.org</p>
            </div>
          </div>
        </div>
      )}
    </FrameComponent>
  )
}

interface InstagramFrameProps {
  image: string
  caption: string
  isDesktop?: boolean
}

function InstagramFrame({ image, caption, isDesktop = false }: InstagramFrameProps) {
  const FrameComponent = isDesktop ? DesktopFrame : PhoneFrame

  return (
    <FrameComponent title="Instagram" icon={<Instagram className="h-5 w-5 text-pink-500" />}>
      {isDesktop ? (
        <div className="bg-white h-full">
          <div className="border-b sticky top-0 z-10 bg-white">
            <div className="flex justify-between items-center p-4">
              <div className="w-24">
                {/* Instagram logo - simplified version */}
                <div className="font-semibold text-lg">Instagram</div>
              </div>
              <div className="flex space-x-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <div className="w-full h-full rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div className="ml-3">
                <div className="font-semibold">artofliving</div>
                <div className="text-xs text-gray-500">Art of Living</div>
              </div>
              <div className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          </div>

          {image && (
            <div className="relative aspect-square">
              <Image
                src={image || "/placeholder.svg?height=500&width=500"}
                alt="Instagram post"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>

            <div className="font-semibold mb-1">1,234 likes</div>
            <div>
              <span className="font-semibold">artofliving</span> <span className="whitespace-pre-line">{caption}</span>
            </div>
            <div className="text-gray-500 text-sm mt-1">View all 42 comments</div>
            <div className="text-gray-400 text-xs mt-1 uppercase">2 HOURS AGO</div>
          </div>
        </div>
      ) : (
        <div className="bg-white h-full">
          <div className="border-b p-2 flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="Profile"
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
            </div>
            <span className="ml-2 text-sm font-medium">artofliving</span>
          </div>

          {image && (
            <div className="relative w-full aspect-square">
              <Image
                src={image || "/placeholder.svg"}
                alt="Instagram post"
                fill
                className="object-cover"
                unoptimized={!image.startsWith("/")}
              />
            </div>
          )}

          <div className="p-3">
            <div className="flex space-x-4 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">123 likes</p>
            <p className="text-sm">
              <span className="font-medium">artofliving</span> <span className="whitespace-pre-wrap">{caption}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">View all 24 comments</p>
            <p className="text-[10px] text-gray-400 mt-1">2 HOURS AGO</p>
          </div>
        </div>
      )}
    </FrameComponent>
  )
}

interface FacebookFrameProps {
  image: string
  post: string
  isDesktop?: boolean
}

function FacebookFrame({ image, post, isDesktop = false }: FacebookFrameProps) {
  const FrameComponent = isDesktop ? DesktopFrame : PhoneFrame

  return (
    <FrameComponent title="Facebook" icon={<Facebook className="h-5 w-5 text-blue-600" />}>
      {isDesktop ? (
        <div className="bg-gray-100 h-full p-4">
          <div className="flex">
            {/* Left sidebar */}
            <div className="w-[200px] pr-4 hidden md:block">
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-md hover:bg-gray-200">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    U
                  </div>
                  <span className="ml-2 font-medium">Your Name</span>
                </div>
                <div className="flex items-center p-2 rounded-md hover:bg-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="ml-2">Friends</span>
                </div>
                <div className="flex items-center p-2 rounded-md hover:bg-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="ml-2">Home</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                {/* Post header */}
                <div className="p-4 flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    AOL
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="font-semibold">Art of Living</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {new Date().toLocaleDateString()} ·
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>

                {/* Post content */}
                <div className="px-4 pb-3">
                  <p className="text-sm whitespace-pre-line mb-3">{post}</p>
                </div>

                {/* Post image */}
                {image && (
                  <div className="border-t border-b border-gray-100">
                    <Image
                      src={image || "/placeholder.svg?height=400&width=600"}
                      alt="Facebook post"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Post stats */}
                <div className="px-4 py-2 flex justify-between text-xs text-gray-500 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2 w-2 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                    </div>
                    <span className="ml-1">428</span>
                  </div>
                  <div>
                    <span>64 comments</span>
                    <span className="mx-1">•</span>
                    <span>12 shares</span>
                  </div>
                </div>

                {/* Post actions */}
                <div className="px-4 py-1 flex justify-between border-b border-gray-100">
                  <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Comment</span>
                  </button>
                  <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Comment input */}
                <div className="p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-500">
                    Write a comment...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 h-full">
          <div className="bg-white p-3 mb-2">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="Profile"
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Art of Living</p>
                <p className="text-xs text-gray-500">
                  2h · <span className="text-xs">🌎</span>
                </p>
              </div>
            </div>

            <p className="text-sm mb-3 whitespace-pre-wrap">{post}</p>

            {image && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Facebook post"
                  fill
                  className="object-cover"
                  unoptimized={!image.startsWith("/")}
                />
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white rounded-full mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                  </svg>
                </span>
                <span>123</span>
              </div>
              <div>24 Comments · 5 Shares</div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mt-2 pt-2 border-t">
              <button className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                Like
              </button>
              <button className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Comment
              </button>
              <button className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </FrameComponent>
  )
}

interface ViewToggleProps {
  view: "mobile" | "desktop"
  onChange: (view: "mobile" | "desktop") => void
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center bg-white rounded-full shadow-md p-1 w-fit mx-auto mb-8">
      <button
        className={`flex items-center px-4 py-2 rounded-full ${
          view === "mobile" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => onChange("mobile")}
      >
        <Smartphone className="w-4 h-4 mr-2" />
        <span>Mobile</span>
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-full ${
          view === "desktop" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => onChange("desktop")}
      >
        <Monitor className="w-4 h-4 mr-2" />
        <span>Desktop</span>
      </button>
    </div>
  )
}

export function MarketingContent({ id }: MarketingContentProps) {
  const [marketing, setMarketing] = useState<MarketingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"mobile" | "desktop">("mobile")

  useEffect(() => {
    async function fetchMarketing() {
      try {
        setLoading(true)
        console.log(`Fetching marketing content for campaign with ID: ${id}`)
        const response = await fetch(`/api/past-campaigns/${id}/marketing-content`)

        if (!response.ok) {
          const errorText = await response.text()
          let errorData = {}
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            console.error("Failed to parse error response:", errorText)
          }

          console.error("API error response:", errorData)
          throw new Error(`Failed to fetch marketing content: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Marketing content from API:", data)
        setMarketing(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching marketing content:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch marketing content")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMarketing()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/dashboard/past-campaigns/${id}/wisdom`}>
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-8">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !marketing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/dashboard/past-campaigns/${id}/wisdom`}>
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Marketing content not found"}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50">
      <div className="flex items-center mb-8">
        <Link href={`/dashboard/past-campaigns/${id}/wisdom`}>
          <Button variant="ghost" size="sm" className="mr-4 hover:bg-slate-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">{marketing.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-1">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
            <Image
              src={marketing.imageUrl || "/placeholder.svg?height=200&width=400"}
              alt={marketing.name}
              fill
              className="object-cover"
              unoptimized={marketing.imageUrl && !marketing.imageUrl.startsWith("/")}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Course</h3>
                  <p className="mt-1 font-semibold text-slate-800">{marketing.course}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Date</h3>
                  <p className="mt-1 font-semibold text-slate-800">{marketing.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Location</h3>
                  <p className="mt-1 font-semibold text-slate-800">{marketing.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Audience</h3>
                  <p className="mt-1 font-semibold text-slate-800">{marketing.audience}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ViewToggle view={view} onChange={setView} />

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-blue-800">Marketing Content</h2>

        {/* Topic 1 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 1 - {marketing.topic1}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            <WhatsAppFrame
              image={marketing.topic1WhatsAppImage}
              message={marketing.topic1WhatsAppMessage}
              isDesktop={view === "desktop"}
            />
            <EmailFrame
              image={marketing.topic1EmailImage}
              content={marketing.topic1Email}
              isDesktop={view === "desktop"}
            />
            <InstagramFrame
              image={marketing.topic1InstagramImage}
              caption={marketing.topic1InstagramPost}
              isDesktop={view === "desktop"}
            />
            <FacebookFrame
              image={marketing.topic1FacebookImage}
              post={marketing.topic1FacebookPost}
              isDesktop={view === "desktop"}
            />
          </div>
        </div>

        {/* Topic 2 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 2 - {marketing.topic2}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            <WhatsAppFrame
              image={marketing.topic2WhatsAppImage}
              message={marketing.topic2WhatsAppMessage}
              isDesktop={view === "desktop"}
            />
            <EmailFrame
              image={marketing.topic2EmailImage}
              content={marketing.topic2Email}
              isDesktop={view === "desktop"}
            />
            <InstagramFrame
              image={marketing.topic2InstagramImage}
              caption={marketing.topic2InstagramPost}
              isDesktop={view === "desktop"}
            />
            <FacebookFrame
              image={marketing.topic2FacebookImage}
              post={marketing.topic2FacebookPost}
              isDesktop={view === "desktop"}
            />
          </div>
        </div>

        {/* Topic 3 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-blue-700 border-b border-blue-100 pb-2">
            Topic 3 - {marketing.topic3}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            <WhatsAppFrame
              image={marketing.topic3WhatsAppImage}
              message={marketing.topic3WhatsAppMessage}
              isDesktop={view === "desktop"}
            />
            <EmailFrame
              image={marketing.topic3EmailImage}
              content={marketing.topic3Email}
              isDesktop={view === "desktop"}
            />
            <InstagramFrame
              image={marketing.topic3InstagramImage}
              caption={marketing.topic3InstagramPost}
              isDesktop={view === "desktop"}
            />
            <FacebookFrame
              image={marketing.topic3FacebookImage}
              post={marketing.topic3FacebookPost}
              isDesktop={view === "desktop"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
