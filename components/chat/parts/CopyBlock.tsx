'use client'

import { Heart, MessageCircle, Send, ThumbsUp } from 'lucide-react'
import type { AmplifyDataParts } from '@/types/message'
import { SkeletonPart } from './SkeletonPart'

interface CopyBlockProps {
  data: AmplifyDataParts['copy-block']
}

function WhatsAppFrame({ content }: { content: string }) {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-md max-w-[300px]">
      {/* Header bar */}
      <div className="bg-[#075E54] text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          A
        </div>
        WhatsApp
      </div>
      {/* Chat background */}
      <div className="bg-[#E5DDD5] p-3 min-h-[80px]">
        {/* Sent message bubble */}
        <div className="bg-[#DCF8C6] rounded-lg p-3 text-sm text-slate-900 max-w-[85%] ml-auto shadow-sm">
          <p className="whitespace-pre-wrap break-words">{content}</p>
          <p className="text-xs text-slate-500 text-right mt-1">{time} ✓✓</p>
        </div>
      </div>
    </div>
  )
}

function InstagramFrame({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[350px] shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
        <span className="text-sm font-medium text-slate-900">amplify_aol</span>
        <span className="ml-auto text-xs text-slate-400">Sponsored</span>
      </div>
      {/* Image area */}
      <div className="bg-slate-100 aspect-square flex items-center justify-center text-slate-400 text-xs">
        Image Preview
      </div>
      {/* Action bar */}
      <div className="flex items-center gap-4 px-3 py-2">
        <Heart className="w-5 h-5 text-slate-700 cursor-pointer hover:text-red-500 transition-colors" />
        <MessageCircle className="w-5 h-5 text-slate-700 cursor-pointer" />
        <Send className="w-5 h-5 text-slate-700 cursor-pointer" />
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  )
}

function EmailFrame({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[400px] shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-3">
        <button className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
          Reply
        </button>
        <button className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
          Forward
        </button>
      </div>
      {/* Email headers */}
      <div className="px-4 py-3 border-b border-slate-100 space-y-1">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">From:</span>
          amplify@amplifyaol.com
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">To:</span>
          your-audience@example.com
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700 w-16 inline-block">Subject:</span>
          Marketing Campaign
        </p>
      </div>
      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  )
}

function FacebookFrame({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white max-w-[350px] shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold shrink-0">
          A
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 leading-none">Amplify AOL</p>
          <p className="text-xs text-slate-400 mt-0.5">Sponsored</p>
        </div>
      </div>
      {/* Content */}
      <div className="px-3 py-2.5">
        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">{content}</p>
      </div>
      {/* Image area */}
      <div className="bg-slate-100 aspect-video flex items-center justify-center text-slate-400 text-xs">
        Ad Image
      </div>
      {/* Engagement bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100">
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <ThumbsUp className="w-4 h-4" />
          Like
        </button>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1877F2] cursor-pointer transition-colors px-3 py-1.5 rounded hover:bg-slate-50 flex-1 justify-center">
          <Send className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

export function CopyBlock({ data }: CopyBlockProps) {
  if (data.status === 'loading') {
    return <SkeletonPart type="card" />
  }

  switch (data.channel) {
    case 'whatsapp':
      return <WhatsAppFrame content={data.content} />
    case 'instagram':
      return <InstagramFrame content={data.content} />
    case 'email':
      return <EmailFrame content={data.content} />
    case 'facebook':
      return <FacebookFrame content={data.content} />
    default:
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 max-w-[400px]">
          <p className="text-sm text-slate-900 whitespace-pre-wrap">{data.content}</p>
        </div>
      )
  }
}
