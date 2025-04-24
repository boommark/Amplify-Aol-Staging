import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface InstagramContentProps {
  caption: string
  imageUrl?: string
  isDesktop?: boolean
  isReels?: boolean
}

export function InstagramContent({ caption, imageUrl, isDesktop = false, isReels = false }: InstagramContentProps) {
  // Process the caption to convert markdown-like syntax to proper markdown
  const processedCaption = caption
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
    <div className={`bg-white ${isDesktop ? "max-w-xl mx-auto" : ""} min-h-full`}>
      {/* Post header */}
      <div className="flex items-center p-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            <div className="w-full h-full rounded-full bg-gray-200"></div>
          </div>
        </div>
        <div className="ml-2 flex-1">
          <div className="font-semibold text-sm">artofliving</div>
          <div className="text-xs text-gray-500">Art of Living</div>
        </div>
        <button className="text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Post image */}
      {imageUrl && (
        <div className={isReels ? "w-full" : "relative aspect-square"}>
          {isReels ? (
            <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
              {" "}
              {/* 16:9 aspect ratio */}
              <Image
                src={imageUrl || "/placeholder.svg?height=500&width=500"}
                alt="Instagram post"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <Image
              src={imageUrl || "/placeholder.svg?height=500&width=500"}
              alt="Instagram post"
              fill
              className="object-cover"
            />
          )}
        </div>
      )}

      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <Bookmark className="w-6 h-6" />
        </div>

        {/* Likes */}
        <div className="font-semibold text-sm mb-1">1,234 likes</div>

        {/* Caption */}
        <div className="text-sm mb-1">
          <span className="font-semibold mr-1">artofliving</span>
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                ),
                strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
              }}
            >
              {processedCaption}
            </ReactMarkdown>
          </div>
        </div>

        {/* Comments */}
        <div className="text-gray-500 text-xs mb-2">View all 42 comments</div>

        {/* Time */}
        <div className="text-gray-400 text-[10px] uppercase">{Math.floor(Math.random() * 12) + 1} hours ago</div>
      </div>

      {/* Comment input */}
      <div className="border-t border-gray-100 p-3 flex items-center">
        <div className="w-6 h-6 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input type="text" placeholder="Add a comment..." className="flex-1 text-sm outline-none" />
        <button className="text-blue-500 font-semibold text-sm">Post</button>
      </div>
    </div>
  )
}
