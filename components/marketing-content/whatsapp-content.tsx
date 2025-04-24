import Image from "next/image"
import { CheckCheck } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface WhatsAppContentProps {
  message: string
  imageUrl?: string
  isDesktop?: boolean
  fullImage?: boolean
}

export function WhatsAppContent({ message, imageUrl, isDesktop = false, fullImage = false }: WhatsAppContentProps) {
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Process the message to convert markdown-like syntax to proper markdown
  const processedMessage = message
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
    <div className={`bg-[#e5ddd5] ${isDesktop ? "p-6" : "p-3"} min-h-full`}>
      {/* Contact header - only show on desktop */}
      {isDesktop && (
        <div className="bg-[#f0f2f5] p-2 flex items-center mb-4 rounded-t-md">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="ml-3">
            <div className="font-medium">Art of Living</div>
            <div className="text-xs text-gray-500">online</div>
          </div>
        </div>
      )}

      {/* System message */}
      <div className="bg-[#fff8c4] text-center text-sm p-1 rounded-md mb-4 mx-auto max-w-[80%]">
        Messages and calls are end-to-end encrypted
      </div>

      {/* Date */}
      <div className="text-center text-xs text-gray-500 my-3">TODAY</div>

      {/* Received message */}
      <div className="flex mb-4">
        <div className="bg-white rounded-lg p-2 max-w-[80%] shadow-sm">
          <p className="text-sm">Hi there! We have an exciting update about our upcoming program.</p>
          <span className="text-[10px] text-gray-500 text-right block">{currentTime}</span>
        </div>
      </div>

      {/* Sent message with image */}
      <div className="flex justify-end mb-2">
        <div className="bg-[#dcf8c6] rounded-lg p-2 max-w-[80%] shadow-sm">
          {imageUrl && (
            <div className="mb-2 rounded-md overflow-hidden">
              {fullImage ? (
                <div className="relative w-full" style={{ maxWidth: "240px" }}>
                  <div className="relative" style={{ paddingBottom: "100%" }}>
                    <Image
                      src={imageUrl || "/placeholder.svg?height=200&width=200"}
                      alt="WhatsApp image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={imageUrl || "/placeholder.svg?height=200&width=200"}
                  alt="WhatsApp image"
                  width={240}
                  height={180}
                  className="w-full h-auto"
                />
              )}
            </div>
          )}
          <div className="text-sm markdown-content">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                ),
                strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
              }}
            >
              {processedMessage}
            </ReactMarkdown>
          </div>
          <div className="flex items-center justify-end mt-1">
            <span className="text-[10px] text-gray-500 mr-1">{currentTime}</span>
            <CheckCheck className="w-3 h-3 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Input field */}
      <div className="bg-[#f0f2f5] rounded-full flex items-center p-2 mt-4">
        <div className="w-full bg-white rounded-full p-2 text-xs text-gray-400">Type a message</div>
      </div>
    </div>
  )
}
