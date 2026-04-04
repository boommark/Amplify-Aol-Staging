'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TextPartProps {
  text: string
}

export function TextPart({ text }: TextPartProps) {
  return (
    <div
      className="prose prose-slate max-w-none break-words
        prose-p:my-2 prose-p:leading-relaxed
        prose-headings:font-semibold prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2
        prose-h1:text-lg prose-h2:text-base prose-h3:text-[15px]
        prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5
        prose-li:my-0.5 prose-li:leading-relaxed
        prose-strong:font-semibold prose-strong:text-slate-900
        prose-blockquote:border-l-[#3D8BE8] prose-blockquote:text-slate-600 prose-blockquote:not-italic prose-blockquote:my-3
        prose-code:bg-slate-200 prose-code:text-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:my-3
        prose-hr:my-4 prose-hr:border-slate-200"
      style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '15px', lineHeight: '1.6', overflowWrap: 'anywhere' }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D8BE8] underline decoration-[#3D8BE8]/30 hover:decoration-[#3D8BE8] transition-colors duration-200"
            >
              {children}
            </a>
          ),
          // Prevent default paragraph margins from collapsing readability
          p: ({ children }) => (
            <p className="my-2 leading-relaxed">{children}</p>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
