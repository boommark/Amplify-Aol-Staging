import Image from "next/image"
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface FacebookContentProps {
  post: string
  imageUrl?: string
  isDesktop?: boolean
}

export function FacebookContent({ post, imageUrl, isDesktop = false }: FacebookContentProps) {
  // Process the post to convert markdown-like syntax to proper markdown
  const processedPost = post
    // Convert **text** to proper markdown bold
    .replace(/\*\*(.*?)\*\*/g, "**$1**")
    // Convert [url] to proper markdown link
    .replace(/\[(https?:\/\/[^\s\]]+)\]/g, "[$1]($1)")
    .replace(/\[(.*?)\]/g, (match, p1) => {
      // Check if it's already a markdown link
      if (p1.includes("](")) return match
      // Check if it looks like a URL
      if (p1.includes(".") && !p1.includes(" ")) {
        return `[${p1}](${p1})`
      }
      return match
    })

  return (
    <div className={`bg-gray-100 ${isDesktop ? "p-4" : "p-2"} min-h-full`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        {/* Post header */}
        <div className="p-3 flex items-start">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            AOL
          </div>
          <div className="ml-2 flex-1">
            <div className="font-semibold">Art of Living</div>
            <div className="text-xs text-gray-500 flex items-center">
              {new Date().toLocaleDateString()} ·
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="px-3 pb-3">
          <div className="text-sm markdown-content">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                ),
                strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
              }}
            >
              {processedPost}
            </ReactMarkdown>
          </div>
        </div>

        {/* Post image */}
        {imageUrl && (
          <div className="border-t border-b border-gray-100">
            <Image
              src={imageUrl || "/placeholder.svg?height=400&width=600"}
              alt="Facebook post"
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Post stats */}
        <div className="px-3 py-2 flex justify-between text-xs text-gray-500 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-2 h-2 text-white" />
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
        <div className="px-3 py-1 flex justify-between border-b border-gray-100">
          <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
            <ThumbsUp className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
            <MessageSquare className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center justify-center py-2 flex-1 text-gray-500 hover:bg-gray-50 rounded-md">
            <Share2 className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comment input */}
        <div className="p-3 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
          <div className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-500">Write a comment...</div>
        </div>
      </div>
    </div>
  )
}
