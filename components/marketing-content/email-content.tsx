import Image from "next/image"
import ReactMarkdown from "react-markdown"

interface EmailContentProps {
  content: string
  imageUrl?: string
  isDesktop?: boolean
}

export function EmailContent({ content, imageUrl, isDesktop = false }: EmailContentProps) {
  // Extract subject from first line of content
  const lines = content.split("\n")
  const subject = lines[0] || "Art of Living Program"
  const bodyRaw = lines.slice(1).join("\n")

  // Process the body to convert markdown-like syntax to proper markdown
  const body = bodyRaw
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
    <div className={`bg-gray-100 ${isDesktop ? "p-6" : "p-2"} min-h-full`}>
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {/* Email header */}
        <div className="border-b border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                AOL
              </div>
              <div className="ml-2">
                <div className="font-medium text-sm">Art of Living Foundation</div>
                <div className="text-xs text-gray-500">info@artofliving.org</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
          </div>
          <div className="font-medium text-sm mb-1">Subject: {subject}</div>
          <div className="text-xs text-gray-500">
            To: <span className="text-blue-600">you@example.com</span>
          </div>
        </div>

        {/* Email body */}
        <div className="p-4">
          {imageUrl && (
            <div className="mb-4">
              <Image
                src={imageUrl || "/placeholder.svg?height=300&width=600"}
                alt="Email banner"
                width={600}
                height={300}
                className="w-full h-auto rounded-md"
              />
            </div>
          )}

          <div className="text-sm markdown-content">
            <p className="mb-4">Dear Friend,</p>
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                ),
                strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
              }}
            >
              {body}
            </ReactMarkdown>
            <p className="mt-4">
              Warm regards,
              <br />
              Art of Living Team
            </p>
          </div>

          {/* Email footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            <p>Art of Living Foundation</p>
            <p>© 2025 Art of Living. All rights reserved.</p>
            <p className="mt-2">
              <a href="#" className="text-blue-600 underline">
                Unsubscribe
              </a>{" "}
              |
              <a href="#" className="text-blue-600 underline ml-2">
                View in browser
              </a>{" "}
              |
              <a href="#" className="text-blue-600 underline ml-2">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
